"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { projects, type Project } from "@/data/projects";
import { createMapStyle, projectTowers, seuColor } from "./mapStyle";
import styles from "./HeroMap.module.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const OVERVIEW = {
  center: projects[0].coords,
  zoom: 15.2,
  pitch: 62,
  bearing: -18,
};

const ORBIT_DEG_PER_SEC = 1.2;
const RESUME_ORBIT_AFTER_MS = 6000;

export default function HeroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let lastInteraction = 0;
    const markers: Marker[] = [];

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      maplibre.setWorkerUrl(`${basePath}/maplibre/maplibre-gl-worker.mjs`);

      const map = new maplibre.Map({
        container: containerRef.current,
        style: createMapStyle(),
        ...OVERVIEW,
        maxPitch: 75,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      });
      mapRef.current = map;

      map.scrollZoom.disable();
      const markInteraction = () => {
        lastInteraction = performance.now();
      };
      map.on("dragstart", markInteraction);
      map.on("rotatestart", markInteraction);
      map.on("pitchstart", markInteraction);

      map.on("load", () => {
        map.addSource("seu-towers", { type: "geojson", data: projectTowers(projects) });
        map.addSource("seu-points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: projects.map((p) => ({
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
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 18, 16, 120],
            "circle-blur": 1,
            "circle-opacity": 0.45,
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

        for (const project of projects) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = styles.pin;
          el.setAttribute("aria-label", project.name);
          el.innerHTML = `
            <span class="${styles.pulse}"></span>
            <span class="${styles.badge}"><img src="${basePath}/brand/logo-wire.svg" alt="" /></span>
            <span class="${styles.label}">${project.name}</span>`;
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            focusProject(project);
          });
          markers.push(
            new maplibre.Marker({ element: el, anchor: "bottom" }).setLngLat(project.coords).addTo(map),
          );
        }

        setReady(true);
      });

      const focusProject = (project: Project) => {
        markInteraction();
        setActive(project);
        map.flyTo({
          center: project.coords,
          zoom: 15.6,
          pitch: 66,
          bearing: map.getBearing() + 40,
          duration: 2600,
          essential: true,
        });
      };

      // Slow cinematic orbit while the visitor is not interacting.
      let previous = performance.now();
      const tick = (now: number) => {
        const dt = (now - previous) / 1000;
        previous = now;
        const idle = now - lastInteraction > RESUME_ORBIT_AFTER_MS;
        if (idle && !map.isMoving()) {
          map.setBearing(map.getBearing() + ORBIT_DEG_PER_SEC * dt);
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const backToOverview = () => {
    setActive(null);
    mapRef.current?.flyTo({ ...OVERVIEW, bearing: mapRef.current.getBearing(), duration: 2400 });
  };

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={`${styles.map} ${ready ? styles.mapReady : ""}`} />

      {active && (
        <div className={styles.caption}>
          <p className={styles.status}>
            {active.status.toUpperCase()} <span>{active.date}</span>
          </p>
          <h2 className={styles.title}>{active.name}</h2>
          <button type="button" className={styles.back} onClick={backToOverview}>
            ← All projects
          </button>
        </div>
      )}
    </div>
  );
}
