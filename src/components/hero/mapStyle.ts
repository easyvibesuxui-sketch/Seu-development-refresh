import type { StyleSpecification } from "maplibre-gl";
import type { MappedProject } from "@/data/projects";

// Light buildings on a ground that matches the page background, deep navy water.
const palette = {
  bg: "#15201d",
  // Ground shares the page colour so the city melts into the background, as in the reference.
  land: "#15201d",
  park: "#1b2e24",
  water: "#0f3446",
  waterLine: "#164257",
  roadMinor: "#24302b",
  roadMajor: "#2f3d37",
  roadHighway: "#3a4943",
  buildingLow: "#8c8a83",
  buildingHigh: "#d2cfc6",
  seu: "#0ea56b",
};

export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
    },
    light: { anchor: "viewport", color: "#ffffff", intensity: 0.35, position: [1.4, 210, 40] },
    sky: {
      "sky-color": palette.bg,
      "horizon-color": palette.bg,
      "fog-color": palette.bg,
      "sky-horizon-blend": 1,
      "horizon-fog-blend": 0.8,
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
        paint: { "fill-color": palette.park, "fill-opacity": 0.9 },
      },
      {
        id: "landuse-park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": palette.park, "fill-opacity": 0.7 },
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
        paint: { "line-color": palette.waterLine, "line-width": 1.4 },
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
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 10, 0.6, 17, 12],
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
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 9, 0.8, 17, 16],
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
          "fill-extrusion-opacity": 1,
          "fill-extrusion-vertical-gradient": true,
        },
      },
    ],
  };
}

const METERS_PER_DEG_LAT = 111_320;

/** Stylised tower cluster for each SEU project, extruded on top of the city. */
export function projectTowers(projects: MappedProject[]): GeoJSON.FeatureCollection {
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
