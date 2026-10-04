"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { distanceKm, highlights, mappedProjects, statusLabel, withBase, type MappedProject } from "@/data/projects";
import { createMapStyle, projectTowers, seuColor } from "./mapStyle";
import FilterPanel from "./FilterPanel";
import { createHighlightPin, createProjectPin } from "./pins";
import styles from "./HeroMap.module.css";

type Mode = "project" | "overview";

const TBILISI_BOUNDS: LngLatBoundsLike = [
  [44.58, 41.6],
  [45.05, 41.84],
];
const PROJECT_ZOOM = 14.2;
const PROJECT_PITCH = 60;
const ORBIT_DEG_PER_SEC = 2.2;
const RESUME_ORBIT_AFTER_MS = 4000;

/** Keeps the active project in the upper part of the hero, clear of the captions. */
function projectPadding(map: MapLibreMap) {
  const h = map.getContainer().clientHeight;
  return { top: 0, bottom: Math.round(h * 0.16), left: 0, right: 0 };
}

export default function HeroMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const modeRef = useRef<Mode>("project");
  const lastInteractionRef = useRef(0);
  const [mode, setMode] = useState<Mode>("project");
  const [active, setActive] = useState<MappedProject>(mappedProjects[0]);
  const [ready, setReady] = useState(false);

  const goToProject = useCallback((project: MappedProject) => {
    const map = mapRef.current;
    if (!map) return;
    modeRef.current = "project";
    setMode("project");
    setActive(project);
    lastInteractionRef.current = performance.now();
    map.dragPan.disable();
    map.flyTo({
      center: project.coords,
      zoom: PROJECT_ZOOM,
      pitch: PROJECT_PITCH,
      bearing: map.getBearing() + 30,
      padding: projectPadding(map),
      duration: 3200,
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
      padding: { top: 340, bottom: 240, left: 200, right: 200 },
      pitch: 48,
      bearing: -12,
    });
    if (!camera) return;
    if (!window.matchMedia("(pointer: coarse)").matches) map.dragPan.enable();
    map.flyTo({ ...camera, pitch: 48, bearing: -12, padding: 0, duration: 2800, essential: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const markers: Marker[] = [];
    const cleanups: (() => void)[] = [];

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      maplibre.setWorkerUrl(withBase("/maplibre/maplibre-gl-worker.mjs"));

      const first = mappedProjects[0];
      const map = new maplibre.Map({
        container: containerRef.current,
        style: createMapStyle(),
        center: first.coords,
        zoom: PROJECT_ZOOM,
        pitch: PROJECT_PITCH,
        bearing: -18,
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
      map.setPadding(projectPadding(map));

      // Drag to orbit around the current centre, so the active project never leaves the view.
      const canvas = map.getCanvasContainer();
      let drag: { x: number; y: number; bearing: number; pitch: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if (modeRef.current === "overview" && e.pointerType === "mouse") return;
        drag = { x: e.clientX, y: e.clientY, bearing: map.getBearing(), pitch: map.getPitch() };
        lastInteractionRef.current = performance.now();
      };
      const onMove = (e: PointerEvent) => {
        if (!drag) return;
        lastInteractionRef.current = performance.now();
        const pitch =
          e.pointerType === "touch"
            ? drag.pitch
            : Math.min(70, Math.max(40, drag.pitch + (e.clientY - drag.y) * 0.12));
        map.jumpTo({ bearing: drag.bearing - (e.clientX - drag.x) * 0.25, pitch });
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
      map.on("dragstart", () => {
        lastInteractionRef.current = performance.now();
      });

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
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 22, 16, 130],
            "circle-blur": 1,
            "circle-opacity": 0.5,
            "circle-pitch-alignment": "map",
          },
        });
        map.addLayer({
          id: "seu-towers",
          type: "fill-extrusion",
          source: "seu-towers",
          paint: {
            "fill-extrusion-color": seuColor,
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-opacity": 0.95,
          },
        });

        for (const project of mappedProjects) {
          const el = createProjectPin(project, () => goToProject(project));
          markers.push(new maplibre.Marker({ element: el, anchor: "bottom", opacityWhenCovered: 1 }).setLngLat(project.coords).addTo(map));
        }
        for (const highlight of highlights) {
          const owner = mappedProjects.find((p) => p.id === highlight.project);
          if (!owner) continue;
          const el = createHighlightPin(highlight, distanceKm(owner.coords, highlight.coords));
          markers.push(new maplibre.Marker({ element: el, anchor: "bottom", opacityWhenCovered: 1 }).setLngLat(highlight.coords).addTo(map));
        }

        setReady(true);
      });

      // Slow orbit around the active project while the visitor is not interacting.
      let previous = performance.now();
      const tick = (now: number) => {
        const dt = Math.min((now - previous) / 1000, 0.1);
        previous = now;
        const idle = now - lastInteractionRef.current > RESUME_ORBIT_AFTER_MS;
        if (modeRef.current === "project" && idle && !drag && !map.isMoving()) {
          map.setBearing(map.getBearing() + ORBIT_DEG_PER_SEC * dt);
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [goToProject]);

  // Landmarks only accompany their own project, never the city overview.
  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLElement>(`.${styles.highlightPin}`).forEach((el) => {
      el.dataset.visible = String(mode === "project" && el.dataset.project === active.id);
    });
  }, [mode, active, ready]);

  return (
    <section ref={rootRef} className={styles.root} data-mode={mode} data-active={active.id}>
      <div className={styles.dome}>
        <div ref={containerRef} className={`${styles.map} ${ready ? styles.mapReady : ""}`} />
      </div>

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
            className={styles.allButton}
            aria-pressed={mode === "overview"}
            onClick={mode === "overview" ? () => goToProject(active) : showAllProjects}
          >
            <GridIcon /> {mode === "overview" ? `Back to ${active.name}` : "All projects"}
          </button>
        </div>
      </div>

      <FilterPanel className={styles.filter} />

      <a href="#about" className={styles.scrollHint} aria-label="Scroll down">
        <span />
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

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="5" height="5" stroke="currentColor" />
      <rect x="8.5" y="0.5" width="5" height="5" stroke="currentColor" />
      <rect x="0.5" y="8.5" width="5" height="5" stroke="currentColor" />
      <rect x="8.5" y="8.5" width="5" height="5" stroke="currentColor" />
    </svg>
  );
}
