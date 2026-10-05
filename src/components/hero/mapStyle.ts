import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";
import type { MappedProject } from "@/data/projects";

/*
 * Daylight model, in the spirit of the ERA 3D map: a pale stone ground, white massing models
 * shaded only by the light, saturated greens, a deep blue river and crisp white streets.
 * SEU projects are the only coloured buildings, in the cognac accent.
 */
export const palette = {
  bg: "#ebe8e1",
  land: "#e6e3dc",
  park: "#b9d79a",
  wood: "#9cc77f",
  water: "#1f5f8b",
  shore: "#ffffff",
  roadMinor: "#f7f6f2",
  roadMajor: "#ffffff",
  roadHighway: "#ffffff",
  streetGlow: "#d9d4ca",
  seu: "#a8541f",
};

const buildingTones = ["#ffffff", "#fbfaf7", "#f6f4ef", "#fdfcf9", "#f2f0ea", "#faf8f4", "#f4f2ed"];

/** Deterministic per-building tone: OSM ids when present, height otherwise. */
const toneIndex: ExpressionSpecification = [
  "%",
  ["+", ["to-number", ["id"], 0], ["round", ["*", ["coalesce", ["get", "render_height"], 0], 7]]],
  buildingTones.length,
];

const buildingColor: ExpressionSpecification = [
  "case",
  // Tall buildings get the glass / brick accents seen in the design render.
  [">", ["coalesce", ["get", "render_height"], 0], 45],
  ["match", ["%", toneIndex, 3], 0, "#f1f3f4", 1, "#eef0ef", "#f7f6f2"],
  ["match", toneIndex, 0, buildingTones[0], 1, buildingTones[1], 2, buildingTones[2], 3, buildingTones[3], 4, buildingTones[4], 5, buildingTones[5], buildingTones[6]],
];

const majorRoads: ExpressionSpecification = ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]];

export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
    },
    light: { anchor: "viewport", color: "#ffffff", intensity: 0.55, position: [1.4, 210, 40] },
    sky: {
      "sky-color": "#f6f1e8",
      "horizon-color": "#f1ece3",
      "fog-color": "#efebe4",
      "sky-horizon-blend": 1,
      "horizon-fog-blend": 0.8,
      "fog-ground-blend": 0.4,
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": palette.land } },
      {
        id: "wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["wood", "forest"]]],
        paint: { "fill-color": palette.wood, "fill-opacity": 0.9 },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["grass", "farmland"]]],
        paint: { "fill-color": palette.park, "fill-opacity": 0.55 },
      },
      {
        id: "landuse-park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": palette.park, "fill-opacity": 0.85 },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": palette.water },
      },
      {
        id: "water-shore",
        type: "line",
        source: "openmaptiles",
        "source-layer": "water",
        paint: {
          "line-color": palette.shore,
          "line-opacity": 0.6,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.6, 16, 2.4],
          "line-blur": 1.2,
        },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": palette.water, "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.5, 16, 8] },
      },
      {
        // Soft shadow casing so the white arteries lift off the ground.
        id: "roads-glow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: majorRoads,
        paint: {
          "line-color": palette.streetGlow,
          "line-opacity": 0.55,
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 10, 1.6, 17, 20],
          "line-blur": ["interpolate", ["linear"], ["zoom"], 10, 1, 17, 6],
        },
      },
      {
        id: "roads-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary"]]],
        paint: {
          "line-color": palette.roadMinor,
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 12, 0.5, 17, 7],
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
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 10, 0.8, 17, 14],
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
          "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 9, 1, 17, 18],
        },
      },
      {
        id: "buildings",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 12.5,
        paint: {
          "fill-extrusion-color": buildingColor,
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

/** Stylised tower cluster for projects still under construction (not in OSM yet). */
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
    if (!p.drawTowers) continue;
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
