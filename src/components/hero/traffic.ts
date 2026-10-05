import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

/*
 * Cars as points of light on the real road network around the camera, like precious stones
 * catching the sun: a small round stone with a bright core, a faint prismatic play in its
 * centre and a soft halo, and now and then a four-ray glint on one of them. Roads come from
 * the loaded vector tiles; cars are points pushed to a GeoJSON source at ~30 fps and drawn
 * upright (facing the camera) over a soft contact shadow.
 */

type Road = { coords: [number, number][]; cumulative: number[]; length: number };
type Car = { road: Road; at: number; speed: number; forward: boolean; phase: number; glint: number };

const SOURCE = "traffic";
const ROAD_CLASSES = ["motorway", "trunk", "primary", "secondary", "tertiary"];
const MAX_CARS = 820;
const STONE = "car-stone";
const GLINT = "car-glint";
// Share of cars that ever glint, and how rarely: each glinting car flashes for ~0.3 s once
// every 7–15 s, so only a handful sparkle across the whole map at any moment.
const GLINT_SHARE = 0.22;

/**
 * Round stone: a bright white point with a faint spectral play in its heart, a soft halo of
 * light and, instead of an outline, a soft shade beneath so it still reads on white roads.
 */
function stoneImage(size = 48) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  const r = size * 0.17;
  const disc = (x: number, y: number, radius: number, fill: string | CanvasGradient) => {
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    g.fillStyle = fill;
    g.fill();
  };
  const radial = (x: number, y: number, r0: number, r1: number, stops: [number, string][]) => {
    const grad = g.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([at, col]) => grad.addColorStop(at, col));
    return grad;
  };

  // Shade under the stone, a touch below it.
  disc(m, m + r * 0.35, r * 1.7, radial(m, m + r * 0.35, r * 0.7, r * 1.7, [[0, "rgba(19,33,29,0.3)"], [1, "rgba(19,33,29,0)"]]));
  // Halo of light around it.
  disc(m, m, m, radial(m, m, r, m, [[0, "rgba(255,255,255,0.75)"], [0.35, "rgba(255,253,246,0.25)"], [1, "rgba(255,255,255,0)"]]));
  // The stone.
  disc(m, m, r, radial(m - r * 0.3, m - r * 0.35, 0, r * 1.05, [[0, "#ffffff"], [0.7, "#f6f8fb"], [1, "#dde5ee"]]));
  // Spectral play in its heart, washed toward white at the very centre.
  if ("createConicGradient" in g) {
    const prism = g.createConicGradient(-Math.PI / 4, m, m);
    ["#ff9fbd", "#ffd98a", "#a6f0cb", "#94d3ff", "#c9a8ff", "#ff9fbd"].forEach((col, i, all) =>
      prism.addColorStop(i / (all.length - 1), col),
    );
    g.save();
    g.globalAlpha = 0.6;
    disc(m, m, r * 0.66, prism);
    g.restore();
  }
  disc(m, m, r * 0.62, radial(m, m, 0, r * 0.62, [[0, "rgba(255,255,255,1)"], [0.3, "rgba(255,255,255,0.8)"], [1, "rgba(255,255,255,0)"]]));
  return g.getImageData(0, 0, size, size);
}

/** Four-ray glint: long vertical and horizontal rays, short diagonals, a soft bloom. */
function glintImage(size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  const bloom = g.createRadialGradient(m, m, 0, m, m, size * 0.18);
  bloom.addColorStop(0, "rgba(255,255,255,0.95)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = bloom;
  g.fillRect(0, 0, size, size);
  const ray = (angle: number, length: number, width: number) => {
    g.save();
    g.translate(m, m);
    g.rotate(angle);
    const grad = g.createLinearGradient(0, -length, 0, length);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.beginPath();
    g.moveTo(0, -length);
    g.quadraticCurveTo(width, 0, 0, length);
    g.quadraticCurveTo(-width, 0, 0, -length);
    g.fillStyle = grad;
    g.fill();
    g.restore();
  };
  ray(0, m * 0.96, size * 0.05);
  ray(Math.PI / 2, m * 0.72, size * 0.045);
  ray(Math.PI / 4, m * 0.32, size * 0.03);
  ray(-Math.PI / 4, m * 0.32, size * 0.03);
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
  if (!map.hasImage(STONE)) map.addImage(STONE, stoneImage(), { pixelRatio: 2 });
  if (!map.hasImage(GLINT)) map.addImage(GLINT, glintImage(), { pixelRatio: 2 });
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
    id: "traffic-stones",
    type: "symbol",
    source: SOURCE,
    layout: {
      "icon-image": STONE,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 12, 0.36, 14, 0.6, 16, 1],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-pitch-alignment": "viewport",
      "icon-rotation-alignment": "viewport",
    },
    paint: { "icon-opacity": ["get", "tw"] },
  });
  map.addLayer({
    id: "traffic-glints",
    type: "symbol",
    source: SOURCE,
    filter: [">", ["get", "gl"], 0.03],
    layout: {
      "icon-image": GLINT,
      // The glint opens up as it flashes.
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        ["*", 0.5, ["get", "gl"]],
        16,
        ["*", 1.1, ["get", "gl"]],
      ],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-pitch-alignment": "viewport",
      "icon-rotation-alignment": "viewport",
    },
    paint: { "icon-opacity": ["get", "gl"] },
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
          // Angular speed of the glint cycle (0 = never glints).
          glint: Math.random() < GLINT_SHARE ? (Math.PI * 2) / (7000 + Math.random() * 8000) : 0,
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
        properties: {
          // Each stone breathes a little; a few flash a glint now and then (a sharp peak of a slow wave).
          tw: 0.86 + 0.14 * Math.sin(now * 0.003 + car.phase),
          gl: car.glint ? Math.max(0, Math.sin(now * car.glint + car.phase)) ** 48 : 0,
        },
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
