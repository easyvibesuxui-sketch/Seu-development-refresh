"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mappedProjects, withBase } from "@/data/projects";
import { createMapStyle, projectTowers, seuColor } from "@/components/hero/mapStyle";

/**
 * The website's half of the gate: the same day map as the home hero, slowly orbiting
 * SEU Varketili. It is a picture, not a control: the whole half is the link.
 */
export default function GateMap({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: MapLibreMap | null = null;
    let frame = 0;
    let cancelled = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const site = mappedProjects[0];

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !ref.current) return;
      maplibre.setWorkerUrl(withBase("/maplibre/maplibre-gl-worker.mjs"));
      map = new maplibre.Map({
        container: ref.current,
        style: createMapStyle(),
        center: site.coords,
        zoom: 15.3,
        pitch: 62,
        bearing: -30,
        interactive: false,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      });
      map.on("load", () => {
        if (!map) return;
        map.addSource("seu-towers", { type: "geojson", data: projectTowers(mappedProjects) });
        map.addSource("seu-points", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: site.coords } }] },
        });
        map.addLayer({
          id: "seu-glow",
          type: "circle",
          source: "seu-points",
          paint: { "circle-color": seuColor, "circle-radius": 90, "circle-blur": 1, "circle-opacity": 0.3, "circle-pitch-alignment": "map" },
        });
        map.addLayer({
          id: "seu-towers",
          type: "fill-extrusion",
          source: "seu-towers",
          paint: { "fill-extrusion-color": "#c2652a", "fill-extrusion-height": ["get", "height"], "fill-extrusion-opacity": 0.92, "fill-extrusion-vertical-gradient": true },
        });
        if (still) return;
        // One turn every four minutes; paused while the tab is hidden.
        let last = performance.now();
        const spin = (now: number) => {
          const dt = Math.min(64, now - last);
          last = now;
          if (!document.hidden) map?.setBearing((map.getBearing() + dt * 0.0015) % 360);
          frame = requestAnimationFrame(spin);
        };
        frame = requestAnimationFrame(spin);
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      map?.remove();
    };
  }, []);

  return <div ref={ref} className={className} style={{ position: "absolute", inset: 0 }} />;
}
