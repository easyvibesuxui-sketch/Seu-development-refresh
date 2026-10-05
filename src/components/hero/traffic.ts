import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

/*
 * Cars as tiny faceted gems driving along the real road network around the camera, as in
 * the ERA model. Roads come from the loaded vector tiles; cars are points pushed to a GeoJSON
 * source at ~30 fps and drawn as an upright diamond icon (facing the camera, never flattened)
 * over a soft contact shadow, each with its own slow shimmer.
 */

type Road = { coords: [number, number][]; cumulative: number[]; length: number };
type Car = { road: Road; at: number; speed: number; forward: boolean; phase: number };

const SOURCE = "traffic";
const ROAD_CLASSES = ["motorway", "trunk", "primary", "secondary", "tertiary"];
const MAX_CARS = 820;
const GEM = "car-gem";

/** Faceted diamond drawn once on a canvas: light top facets, cooler lower facets, fine outline. */
function gemImage(size = 40) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  const w = size * 0.3;
  const h = size * 0.42;
  const top: [number, number] = [m, m - h];
  const bottom: [number, number] = [m, m + h];
  const left: [number, number] = [m - w, m];
  const right: [number, number] = [m + w, m];
  const face = (pts: [number, number][], fill: string) => {
    g.beginPath();
    g.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => g.lineTo(...p));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  };
  // Four facets around a bright centre, like a cut stone.
  face([top, right, [m, m]], "#ffffff");
  face([top, left, [m, m]], "#eef2f4");
  face([bottom, right, [m, m]], "#c9d3d8");
  face([bottom, left, [m, m]], "#dfe6ea");
  g.beginPath();
  g.moveTo(...top);
  g.lineTo(...right);
  g.lineTo(...bottom);
  g.lineTo(...left);
  g.closePath();
  g.lineWidth = size * 0.035;
  g.strokeStyle = "rgba(19,33,29,0.55)";
  g.stroke();
  // Specular glint.
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath();
  g.arc(m - w * 0.28, m - h * 0.38, size * 0.05, 0, Math.PI * 2);
  g.fill();
  return g.getImageData(0, 0, size, size);
}
const FRAME_MS = 33;
const METERS_PER_DEG_LAT = 111_320;

function toRoad(coords: [number, number][]): Road | null {
  if (coords.length < 2) return null;
  const k = Math.cos((coords[0][1] * Math.PI) / 180);
  const cumulative = [0];
  for (let i = 1; i < coords.length; i++) {
    const dx = (coords[i][0] - coords[i - 1][0]) * k;
    const dy = coords[i][1] - coords[i - 1][1];
    cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy) * METERS_PER_DEG_LAT);
  }
  const length = cumulative[cumulative.length - 1];
  return length > 60 ? { coords, cumulative, length } : null;
}

function pointAt(road: Road, at: number): [number, number] {
  const { coords, cumulative } = road;
  let lo = 0;
  let hi = cumulative.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < at) lo = mid;
    else hi = mid;
  }
  const span = cumulative[hi] - cumulative[lo] || 1;
  const t = (at - cumulative[lo]) / span;
  return [coords[lo][0] + (coords[hi][0] - coords[lo][0]) * t, coords[lo][1] + (coords[hi][1] - coords[lo][1]) * t];
}

export function createTraffic(map: MapLibreMap) {
  let roads: Road[] = [];
  let cars: Car[] = [];
  let frame = 0;
  let last = 0;
  let running = false;

  map.addSource(SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  if (!map.hasImage(GEM)) map.addImage(GEM, gemImage(), { pixelRatio: 2 });
  map.addLayer({
    // Contact shadow on the road surface.
    id: "traffic-shadow",
    type: "circle",
    source: SOURCE,
    paint: {
      "circle-color": "#13211d",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 1.2, 16, 3.4],
      "circle-blur": 0.9,
      "circle-opacity": 0.22,
      "circle-translate": [1, 1.5],
      "circle-pitch-alignment": "map",
    },
  });
  map.addLayer({
    id: "traffic-gems",
    type: "symbol",
    source: SOURCE,
    layout: {
      "icon-image": GEM,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 12, 0.32, 14, 0.55, 16, 0.95],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-pitch-alignment": "viewport",
      "icon-rotation-alignment": "viewport",
      "icon-anchor": "bottom",
    },
    paint: { "icon-opacity": ["get", "tw"] },
  });

  const collectRoads = () => {
    const features = map.querySourceFeatures("openmaptiles", {
      sourceLayer: "transportation",
      filter: ["in", ["get", "class"], ["literal", ROAD_CLASSES]],
    });
    const next: Road[] = [];
    for (const f of features) {
      const g = f.geometry;
      const lines = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
      for (const line of lines) {
        const road = toRoad(line as [number, number][]);
        if (road) next.push(road);
      }
    }
    roads = next;
    // Busier roads (longer segments) get proportionally more cars.
    const total = roads.reduce((s, r) => s + r.length, 0);
    cars = [];
    if (!total) return;
    for (const road of roads) {
      // At least one car per sampled road so side streets are alive too.
      const count = Math.max(1, Math.round((road.length / total) * MAX_CARS));
      for (let i = 0; i < count; i++) {
        cars.push({
          road,
          at: Math.random() * road.length,
          speed: 7 + Math.random() * 6,
          forward: Math.random() > 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    // Dense tiles can yield thousands of short segments; keep a random, bounded set.
    if (cars.length > MAX_CARS) {
      for (let i = cars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cars[i], cars[j]] = [cars[j], cars[i]];
      }
      cars.length = MAX_CARS;
    }
  };

  const step = (now: number) => {
    frame = requestAnimationFrame(step);
    if (now - last < FRAME_MS) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    // Visual speed is exaggerated so motion reads at city scale.
    const boost = 2.2;
    const features: GeoJSON.Feature[] = cars.map((car) => {
      car.at += car.speed * boost * dt * (car.forward ? 1 : -1);
      if (car.at > car.road.length) car.at = 0;
      if (car.at < 0) car.at = car.road.length;
      return {
        type: "Feature",
        // A slow shimmer per car, so the stream of gems sparkles.
        properties: { tw: 0.72 + 0.28 * Math.sin(now * 0.004 + car.phase) },
        geometry: { type: "Point", coordinates: pointAt(car.road, car.at) },
      };
    });
    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });
  };

  // Re-sample roads only when the camera has really moved, so cars don't jump on every idle.
  let sampledAt: { lng: number; lat: number; zoom: number } | null = null;
  const onIdle = () => {
    const c = map.getCenter();
    const zoom = map.getZoom();
    if (sampledAt) {
      const movedKm = Math.hypot((c.lng - sampledAt.lng) * 83, (c.lat - sampledAt.lat) * 111);
      if (movedKm < 0.6 && Math.abs(zoom - sampledAt.zoom) < 0.6 && cars.length) return;
    }
    sampledAt = { lng: c.lng, lat: c.lat, zoom };
    collectRoads();
  };
  map.on("idle", onIdle);

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    destroy() {
      this.stop();
      map.off("idle", onIdle);
    },
  };
}
