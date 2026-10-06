"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { distanceKm, highlights, mappedProjects, statusLabel, withBase, type MappedProject } from "@/data/projects";
import { INTRO_EVENT, introStarted, markMapReady } from "@/lib/intro";
import { createMapStyle, projectTowers, seuColor } from "./mapStyle";
import { createTraffic } from "./traffic";
import FilterPanel from "./FilterPanel";
import Clouds, { type CloudsHandle } from "./Clouds";
import { createHighlightPin, createProjectPin } from "./pins";
import styles from "./HeroMap.module.css";

type Mode = "project" | "overview";

const TBILISI_BOUNDS: LngLatBoundsLike = [
  [44.58, 41.6],
  [45.05, 41.84],
];
const PROJECT_ZOOM = 14.6;
const PROJECT_PITCH = 60;
const PROJECT_BEARING = -18;
const INTRO_SECONDS = 3.6;

/** Keeps the active project in the upper part of the hero, clear of the captions. */
function projectPadding(map: MapLibreMap) {
  const h = map.getContainer().clientHeight;
  return { top: 0, bottom: Math.round(h * 0.16), left: 0, right: 0 };
}

export default function HeroMap() {
  const rootRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<CloudsHandle>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const modeRef = useRef<Mode>("project");
  const [mode, setMode] = useState<Mode>("project");
  const [active, setActive] = useState<MappedProject>(mappedProjects[0]);
  const [ready, setReady] = useState(false);
  const [landed, setLanded] = useState(false);

  const goToProject = useCallback((project: MappedProject) => {
    const map = mapRef.current;
    if (!map) return;
    modeRef.current = "project";
    setMode("project");
    setActive(project);
    map.dragPan.disable();
    map.flyTo({
      center: project.coords,
      zoom: PROJECT_ZOOM,
      pitch: PROJECT_PITCH,
      bearing: PROJECT_BEARING,
      padding: projectPadding(map),
      duration: 3000,
      curve: 1.6,
      essential: true,
    });
  }, []);

  const showAllProjects = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    modeRef.current = "overview";
    setMode("overview");
    const bounds = mappedProjects.reduce<[[number, number], [number, number]]>(
      ([[w, s], [e, n]], p) => [
        [Math.min(w, p.coords[0]), Math.min(s, p.coords[1])],
        [Math.max(e, p.coords[0]), Math.max(n, p.coords[1])],
      ],
      [
        [180, 90],
        [-180, -90],
      ],
    );
    const camera = map.cameraForBounds(bounds, {
      padding: { top: 340, bottom: 240, left: 220, right: 220 },
      pitch: 48,
      bearing: -12,
    });
    if (!camera) return;
    if (!window.matchMedia("(pointer: coarse)").matches) map.dragPan.enable();
    map.flyTo({ ...camera, pitch: 48, bearing: -12, padding: 0, duration: 2800, essential: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const markers: Marker[] = [];
    const cleanups: (() => void)[] = [];

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      maplibre.setWorkerUrl(withBase("/maplibre/maplibre-gl-worker.mjs"));

      const first = mappedProjects[0];
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // The intro starts high above the city, hidden by clouds, and descends onto the project.
      const map = new maplibre.Map({
        container: containerRef.current,
        style: createMapStyle(),
        center: first.coords,
        zoom: 12.2,
        pitch: 0,
        bearing: -50,
        maxPitch: 72,
        maxBounds: TBILISI_BOUNDS,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
        dragPan: false,
        dragRotate: false,
        scrollZoom: false,
        touchZoomRotate: false,
        doubleClickZoom: false,
        keyboard: false,
      });
      mapRef.current = map;

      // Drag rotates the camera around the active project, so its pin never leaves the view.
      const canvas = map.getCanvasContainer();
      let drag: { x: number; y: number; bearing: number; pitch: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if (modeRef.current === "overview" && e.pointerType === "mouse") return;
        drag = { x: e.clientX, y: e.clientY, bearing: map.getBearing(), pitch: map.getPitch() };
      };
      const onMove = (e: PointerEvent) => {
        if (!drag) return;
        const pitch =
          e.pointerType === "touch" ? drag.pitch : Math.min(70, Math.max(40, drag.pitch - (e.clientY - drag.y) * 0.12));
        // Dragging right turns the city to the right, like grabbing a globe.
        map.jumpTo({ bearing: drag.bearing + (e.clientX - drag.x) * 0.25, pitch });
      };
      const onUp = () => {
        drag = null;
      };
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      cleanups.push(() => {
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
      });

      let hasLanded = false;
      let styleReady = false;
      let startTraffic = () => {};
      const land = () => {
        if (cancelled || hasLanded) return;
        if (!styleReady) return; // the "load" handler lands once the style is in
        hasLanded = true;
        cloudsRef.current?.descend(reduceMotion ? 0.6 : INTRO_SECONDS);
        map.flyTo({
          center: first.coords,
          zoom: PROJECT_ZOOM,
          pitch: PROJECT_PITCH,
          bearing: PROJECT_BEARING,
          padding: projectPadding(map),
          duration: reduceMotion ? 0 : INTRO_SECONDS * 1000,
          curve: 1.2,
          essential: true,
        });
        // Captions follow the descent on a timer; moveend can be swallowed by user input.
        window.setTimeout(() => setLanded(true), reduceMotion ? 0 : INTRO_SECONDS * 650);
        map.once("moveend", () => startTraffic());
      };

      map.on("load", () => {
        map.addSource("seu-towers", { type: "geojson", data: projectTowers(mappedProjects) });
        map.addSource("seu-points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: mappedProjects.map((p) => ({
              type: "Feature",
              properties: { id: p.id },
              geometry: { type: "Point", coordinates: p.coords },
            })),
          },
        });
        map.addLayer({
          id: "seu-glow",
          type: "circle",
          source: "seu-points",
          paint: {
            "circle-color": seuColor,
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 14, 16, 80],
            "circle-blur": 1,
            "circle-opacity": 0.28,
            "circle-pitch-alignment": "map",
          },
        });
        map.addLayer({
          id: "seu-towers",
          type: "fill-extrusion",
          source: "seu-towers",
          paint: {
            "fill-extrusion-color": "#c2652a",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-opacity": 0.92,
            "fill-extrusion-vertical-gradient": true,
          },
        });

        // Cars start only after landing: their per-frame updates keep the map from ever
        // reporting "idle", which the intro handshake relies on.
        const traffic = createTraffic(map);
        cleanups.push(() => traffic.destroy());
        let heroVisible = true;
        startTraffic = () => {
          if (!reduceMotion && heroVisible) traffic.start();
        };
        const io = new IntersectionObserver(([entry]) => {
          heroVisible = entry.isIntersecting;
          if (!hasLanded || reduceMotion) return;
          if (heroVisible) traffic.start();
          else traffic.stop();
        });
        if (rootRef.current) io.observe(rootRef.current);
        cleanups.push(() => io.disconnect());

        const addMarker = (el: HTMLElement, coords: [number, number]) =>
          markers.push(
            new maplibre.Marker({ element: el, anchor: "bottom", opacityWhenCovered: 1, subpixelPositioning: true })
              .setLngLat(coords)
              .addTo(map),
          );
        for (const project of mappedProjects) addMarker(createProjectPin(project, () => goToProject(project)), project.coords);
        for (const highlight of highlights) {
          const owner = mappedProjects.find((p) => p.id === highlight.project);
          if (owner) addMarker(createHighlightPin(highlight, distanceKm(owner.coords, highlight.coords)), highlight.coords);
        }

        setReady(true);
        styleReady = true;
        if (introStarted()) land();
        // Tell the preloader once the first tiles are drawn (or after a grace period on slow networks).
        let announced = false;
        const announce = () => {
          if (announced || cancelled) return;
          announced = true;
          markMapReady();
        };
        map.once("idle", announce);
        const grace = window.setTimeout(announce, 5000);
        cleanups.push(() => window.clearTimeout(grace));
      });

      const onIntro = () => land();
      window.addEventListener(INTRO_EVENT, onIntro);
      cleanups.push(() => window.removeEventListener(INTRO_EVENT, onIntro));
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [goToProject]);

  // Landmarks only accompany their own project, never the city overview.
  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLElement>(`.${styles.highlightPin}`).forEach((el) => {
      el.dataset.visible = String(landed && mode === "project" && el.dataset.project === active.id);
    });
  }, [mode, active, ready, landed]);

  return (
    <section
      ref={rootRef}
      className={`${styles.root} vars-light`}
      data-tone="light"
      data-no-out
      data-mode={mode}
      data-landed={landed}
      data-active={active.id}
      data-cursor="drag"
    >
      <div className={styles.dome}>
        <div ref={containerRef} className={`${styles.map} ${ready ? styles.mapReady : ""}`} />
      </div>
      <Clouds ref={cloudsRef} />

      <div className={styles.caption}>
        {mode === "project" ? (
          <div key={active.id} className={styles.captionInner}>
            <p className={styles.status}>
              <FlagIcon /> {statusLabel[active.status].toUpperCase()} <span>{active.date}</span>
            </p>
            <h1 className={styles.title}>{active.name}</h1>
          </div>
        ) : (
          <div key="overview" className={styles.captionInner}>
            <p className={styles.status}>Tbilisi · {mappedProjects.length} projects</p>
            <h1 className={styles.title}>All projects</h1>
            <div className={styles.legend}>
              <span data-status="ongoing">Ongoing</span>
              <span data-status="finished">Finished</span>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.dots} role="tablist" aria-label="Projects">
            {mappedProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={mode === "project" && active.id === p.id}
                aria-label={p.name}
                className={styles.dot}
                onClick={() => goToProject(p)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.allLink}
            aria-pressed={mode === "overview"}
            onClick={() => {
              if (mode === "overview") goToProject(active);
              else showAllProjects();
            }}
          >
            <span>{mode === "overview" ? `Back to ${active.name}` : "All projects"}</span>
          </button>
        </div>
      </div>

      <FilterPanel className={styles.filter} />

      <a href="#about" className={styles.scrollHint} aria-label="Scroll to About company">
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
          <path d="M7 1v13M1 8l6 6 6-6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </a>
    </section>
  );
}

function FlagIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
      <path d="M1 15V1h10l-2 3.5L11 8H1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
