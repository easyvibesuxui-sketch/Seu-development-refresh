import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

/*
 * Glowing car lights driving along the real road network around the camera.
 * Roads come from the loaded vector tiles; cars are points pushed to a GeoJSON source
 * at ~30 fps. Headlights (warm white) and tail lights (red) travel in opposite directions.
 */

type Road = { coords: [number, number][]; cumulative: number[]; length: number };
type Car = { road: Road; at: number; speed: number; forward: boolean };

const SOURCE = "traffic";
const ROAD_CLASSES = ["motorway", "trunk", "primary", "secondary", "tertiary"];
const MAX_CARS = 720;
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
  map.addLayer({
    id: "traffic-glow",
    type: "circle",
    source: SOURCE,
    paint: {
      "circle-color": ["match", ["get", "kind"], "head", "#ffe3b0", "#ff3b30"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 16, 9],
      "circle-blur": 1,
      "circle-opacity": 0.55,
      "circle-pitch-alignment": "map",
    },
  });
  map.addLayer({
    id: "traffic-core",
    type: "circle",
    source: SOURCE,
    paint: {
      "circle-color": ["match", ["get", "kind"], "head", "#fffaf0", "#ff8a80"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 0.8, 16, 2.4],
      "circle-pitch-alignment": "map",
    },
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
        cars.push({ road, at: Math.random() * road.length, speed: 7 + Math.random() * 6, forward: Math.random() > 0.5 });
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
        properties: { kind: car.forward ? "head" : "tail" },
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
