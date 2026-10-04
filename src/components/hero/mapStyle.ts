import type { StyleSpecification } from "maplibre-gl";
import type { Project } from "@/data/projects";

const palette = {
  bg: "#16201d",
  land: "#18231f",
  park: "#1b2b23",
  water: "#0d2a35",
  waterLine: "#14394a",
  roadMinor: "#2b3833",
  roadMajor: "#3b4a44",
  roadHighway: "#3f4f48",
  buildingLow: "#2f3b36",
  buildingHigh: "#6b7973",
  seu: "#0ea56b",
};

export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
    },
    sky: {
      "sky-color": palette.bg,
      "horizon-color": palette.bg,
      "fog-color": palette.bg,
      "sky-horizon-blend": 0.6,
      "horizon-fog-blend": 0.4,
      "fog-ground-blend": 0.35,
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": palette.land } },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["grass", "wood"]]],
        paint: { "fill-color": palette.park, "fill-opacity": 0.8 },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": palette.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": palette.waterLine, "line-width": 1.2 },
      },
      {
        id: "roads-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary"]]],
        paint: {
          "line-color": palette.roadMinor,
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 0.4, 17, 6],
        },
      },
      {
        id: "roads-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["primary", "secondary"]]],
        paint: {
          "line-color": palette.roadMajor,
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 11, 0.6, 17, 12],
        },
      },
      {
        id: "roads-highway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
        paint: {
          "line-color": palette.roadHighway,
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 10, 0.8, 17, 16],
        },
      },
      {
        id: "buildings",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "render_height"], 6],
            0,
            palette.buildingLow,
            60,
            palette.buildingHigh,
          ],
          // Most Tbilisi buildings lack height tags, so give them a believable minimum.
          "fill-extrusion-height": ["max", ["coalesce", ["get", "render_height"], 0], 9],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.92,
        },
      },
    ],
  };
}

const METERS_PER_DEG_LAT = 111_320;

/** Stylised tower cluster for each SEU project, extruded on top of the city. */
export function projectTowers(projects: Project[]): GeoJSON.FeatureCollection {
  const offsets: [number, number][] = [
    [-45, 30],
    [0, 35],
    [45, 25],
    [-30, -25],
    [30, -30],
  ];
  const size = 22;
  const features: GeoJSON.Feature[] = [];
  for (const p of projects) {
    const [lng, lat] = p.coords;
    const mPerDegLng = METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
    offsets.forEach(([dx, dy], i) => {
      const cx = lng + dx / mPerDegLng;
      const cy = lat + dy / METERS_PER_DEG_LAT;
      const hx = size / 2 / mPerDegLng;
      const hy = size / 2 / METERS_PER_DEG_LAT;
      features.push({
        type: "Feature",
        properties: { project: p.id, height: p.floors * 3.3 + (i % 2) * 6 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [cx - hx, cy - hy],
              [cx + hx, cy - hy],
              [cx + hx, cy + hy],
              [cx - hx, cy + hy],
              [cx - hx, cy - hy],
            ],
          ],
        },
      });
    });
  }
  return { type: "FeatureCollection", features };
}

export const seuColor = palette.seu;
