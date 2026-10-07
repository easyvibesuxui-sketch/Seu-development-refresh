"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Sheet from "@/components/ui/Sheet";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mappedProjects, withBase } from "@/data/projects";
import { createMapStyle, mapLocale, projectTowers, seuColor } from "@/components/hero/mapStyle";
import { atMinutes, clock, sunPosition, sunTimes } from "@/lib/sun";
import { useLang } from "@/lib/useLang";

/*
 * Sun study, in the manner of Shadowmap: the site in 3D with a compass ring on the ground,
 * the sun's path across the day projected inside the ring (today in gold, the June and
 * December solstices dashed), a beam toward the sun, and every building casting its shadow
 * for the chosen time and date. Time and date sliders, a day-long play, and "now".
 * Shadows are 2.5D: each footprint is swept along the shadow vector (height / tan altitude)
 * and wrapped in its convex hull, which is close for the block-like buildings here.
 */

const UTC_OFFSET = 4; // Tbilisi, no daylight saving
const RING = 210; // compass ring radius, metres
const M_LAT = 111_320;
const rad = Math.PI / 180;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_KA = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const COMPASS_KA = ["ჩ", "ჩა", "ა", "სა", "ს", "სდ", "დ", "ჩდ"];

type Pt = [number, number];

const dayOf = (year: number, doy: number) => new Date(Date.UTC(year, 0, 1) + doy * 86_400_000);

function hull(points: Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p[i]) <= 0) upper.pop();
    upper.push(p[i]);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export default function SunStudy({ onClose, variant = "full", place }: { onClose: () => void; variant?: "full" | "sheet"; place?: string }) {
  const site = mappedProjects[0];
  const [lng, lat] = site.coords;
  const now = new Date();
  const local = new Date(now.valueOf() + UTC_OFFSET * 3_600_000);
  const year = local.getUTCFullYear();
  const [doy, setDoy] = useState(() => Math.floor((local.valueOf() - Date.UTC(year, 0, 1)) / 86_400_000));
  const [minutes, setMinutes] = useState(() => local.getUTCHours() * 60 + local.getUTCMinutes());
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<{ sun?: Marker; rise?: Marker; set?: Marker }>({});
  const buildingsRef = useRef<{ ring: Pt[]; h: number }[]>([]);
  const [ready, setReady] = useState(false);
  // Bumped whenever a new set of buildings has been read from the tiles.
  const [built, setBuilt] = useState(0);
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  const day = useMemo(() => dayOf(year, doy), [year, doy]);
  const times = useMemo(() => sunTimes(day, lat, lng, UTC_OFFSET), [day, lat, lng]);
  const sun = useMemo(() => sunPosition(atMinutes(day, minutes, UTC_OFFSET), lat, lng), [day, minutes, lat, lng]);

  // Metres east/north of the site to [lng, lat].
  const at = useMemo(() => {
    const k = M_LAT * Math.cos(lat * rad);
    return (dx: number, dy: number): Pt => [lng + dx / k, lat + dy / M_LAT];
  }, [lng, lat]);
  const local2 = useMemo(() => {
    const k = M_LAT * Math.cos(lat * rad);
    return ([x, y]: Pt): Pt => [(x - lng) * k, (y - lat) * M_LAT];
  }, [lng, lat]);

  // Sky-dome projection of a sun position onto the ground disc inside the ring.
  const onDisc = (az: number, alt: number, r = RING * 0.86) => {
    const d = r * Math.cos(Math.max(0, alt) * rad);
    return at(Math.sin(az * rad) * d, Math.cos(az * rad) * d);
  };

  const pathFor = (d: Date) => {
    const t = sunTimes(d, lat, lng, UTC_OFFSET);
    const pts: Pt[] = [];
    for (let m = t.rise; m <= t.set; m += 6) {
      const p = sunPosition(atMinutes(d, m, UTC_OFFSET), lat, lng);
      pts.push(onDisc(p.azimuth, p.altitude));
    }
    return pts;
  };

  // Escape closes; focus moves into the dialog and the page behind stops scrolling.
  const closeFn = useRef(onClose);
  useEffect(() => {
    closeFn.current = onClose;
  }, [onClose]);
  useEffect(() => {
    // In a sheet, the sheet owns focus, Escape and the page lock.
    if (variant === "sheet") return;
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && closeFn.current();
    window.addEventListener("keydown", key);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      html.style.overflow = prev;
    };
  }, [variant]);

  // The map, the ring and the static paths.
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;
    const statics: Marker[] = [];
    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      maplibre.setWorkerUrl(withBase("/maplibre/maplibre-gl-worker.mjs"));
      map = new maplibre.Map({
        container: containerRef.current,
        style: createMapStyle(),
        locale: mapLocale(lang),
        center: site.coords,
        zoom: 16.4,
        pitch: 52,
        bearing: -18,
        maxPitch: 70,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");

      map.on("load", () => {
        if (!map) return;
        const towers = projectTowers(mappedProjects);
        const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
        map.addSource("seu-towers", { type: "geojson", data: towers });
        map.addSource("shadows", { type: "geojson", data: empty });
        map.addSource("ring", { type: "geojson", data: empty });
        map.addSource("paths", { type: "geojson", data: empty });
        map.addSource("beam", { type: "geojson", data: empty });

        map.addLayer(
          { id: "shadows", type: "fill", source: "shadows", paint: { "fill-color": "#24323a", "fill-opacity": 0.34 } },
          "buildings",
        );
        map.addLayer({
          id: "seu-towers",
          type: "fill-extrusion",
          source: "seu-towers",
          paint: { "fill-extrusion-color": seuColor, "fill-extrusion-height": ["get", "height"], "fill-extrusion-opacity": 1 },
        });
        map.addLayer({ id: "ring-band", type: "fill", source: "ring", filter: ["==", ["get", "kind"], "band"], paint: { "fill-color": "#ffffff", "fill-opacity": 0.42 } });
        map.addLayer({
          id: "ring-lines",
          type: "line",
          source: "ring",
          filter: ["!=", ["get", "kind"], "band"],
          paint: { "line-color": "#13211d", "line-opacity": ["case", ["==", ["get", "kind"], "major"], 0.7, 0.35], "line-width": 1.2 },
        });
        map.addLayer({
          id: "paths-season",
          type: "line",
          source: "paths",
          filter: ["==", ["get", "kind"], "season"],
          paint: { "line-color": "#ffffff", "line-width": 1.6, "line-dasharray": [3, 3], "line-opacity": 0.95 },
        });
        map.addLayer({ id: "beam-glow", type: "line", source: "beam", paint: { "line-color": "#ffd76a", "line-width": 14, "line-opacity": 0.35, "line-blur": 8 } });
        map.addLayer({ id: "beam", type: "line", source: "beam", paint: { "line-color": "#ffd23f", "line-width": 3 } });
        map.addLayer({ id: "paths-today", type: "line", source: "paths", filter: ["==", ["get", "kind"], "today"], paint: { "line-color": "#f2c230", "line-width": 3.5 } });

        // Ring: band, minor ticks every 10°, major every 30°.
        const band: Pt[] = [];
        const inner: Pt[] = [];
        for (let a = 0; a <= 360; a += 3) {
          band.push(at(Math.sin(a * rad) * RING, Math.cos(a * rad) * RING));
          inner.push(at(Math.sin(a * rad) * RING * 0.86, Math.cos(a * rad) * RING * 0.86));
        }
        const ticks: GeoJSON.Feature[] = [];
        for (let a = 0; a < 360; a += 10) {
          const major = a % 30 === 0;
          const r0 = RING * 0.86;
          const r1 = RING * (major ? 1 : 0.93);
          ticks.push({
            type: "Feature",
            properties: { kind: major ? "major" : "minor" },
            geometry: { type: "LineString", coordinates: [at(Math.sin(a * rad) * r0, Math.cos(a * rad) * r0), at(Math.sin(a * rad) * r1, Math.cos(a * rad) * r1)] },
          });
        }
        (map.getSource("ring") as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [
            { type: "Feature", properties: { kind: "band" }, geometry: { type: "Polygon", coordinates: [band, inner.reverse()] } },
            ...ticks,
          ],
        });

        // Lettering lies flat on the ground with the ring.
        const flat = (html: string, className: string, a: number, r: number) => {
          const el = document.createElement("div");
          el.className = className;
          el.innerHTML = html;
          const m = new maplibre.Marker({ element: el, pitchAlignment: "map", rotationAlignment: "map" })
            .setLngLat(at(Math.sin(a * rad) * r, Math.cos(a * rad) * r))
            .addTo(map!);
          statics.push(m);
        };
        ["N", "E", "S", "W"].forEach((l, i) => flat(l, "sun-compass", i * 90, RING * 1.1));
        for (let a = 30; a < 360; a += 30) if (a % 90) flat(String(a), "sun-degree", a, RING * 0.93);

        // Today's sun and the sunrise / sunset badges stay upright.
        const badge = (cls: string) => {
          const el = document.createElement("div");
          el.className = cls;
          return new maplibre.Marker({ element: el }).setLngLat(site.coords).addTo(map!);
        };
        markersRef.current = { rise: badge("sun-badge sun-badge--edge"), set: badge("sun-badge sun-badge--edge"), sun: badge("sun-badge sun-badge--sun") };

        // Buildings come and go with the tiles; keep a de-duplicated set near the site.
        const collect = () => {
          if (!map) return;
          const out: { ring: Pt[]; h: number }[] = [];
          const seen = new Set<string>();
          for (const f of map.querySourceFeatures("openmaptiles", { sourceLayer: "building" })) {
            const g = f.geometry;
            const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
            const h = Math.max(Number(f.properties?.render_height ?? 0), 9);
            for (const poly of polys) {
              const ring = poly[0] as Pt[];
              const key = `${ring[0][0].toFixed(6)},${ring[0][1].toFixed(6)},${ring.length}`;
              if (seen.has(key)) continue;
              seen.add(key);
              const [x, y] = local2(ring[0]);
              if (Math.hypot(x, y) < 1400) out.push({ ring, h });
            }
          }
          for (const f of towers.features) {
            if (f.geometry.type === "Polygon") out.push({ ring: f.geometry.coordinates[0] as Pt[], h: Number(f.properties?.height ?? 30) });
          }
          buildingsRef.current = out;
          setBuilt((n) => n + 1);
        };
        map.on("idle", collect);
        setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      statics.forEach((m) => m.remove());
      map?.remove();
      mapRef.current = null;
    };
    // The map is built once for the site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Season and today's paths change with the date.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getSource("paths")) return;
    const line = (pts: Pt[], kind: string): GeoJSON.Feature => ({ type: "Feature", properties: { kind }, geometry: { type: "LineString", coordinates: pts } });
    (map.getSource("paths") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: [line(pathFor(dayOf(year, 171)), "season"), line(pathFor(dayOf(year, 354)), "season"), line(pathFor(day), "today")],
    });
    const edge = (m: number) => sunPosition(atMinutes(day, m, UTC_OFFSET), lat, lng).azimuth;
    const { rise, set } = markersRef.current;
    const riseAz = edge(times.rise);
    const setAz = edge(times.set);
    rise?.setLngLat(at(Math.sin(riseAz * rad) * RING * 0.86, Math.cos(riseAz * rad) * RING * 0.86));
    set?.setLngLat(at(Math.sin(setAz * rad) * RING * 0.86, Math.cos(setAz * rad) * RING * 0.86));
    if (rise) rise.getElement().textContent = clock(times.rise);
    if (set) set.getElement().textContent = clock(times.set);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, ready, times]);

  // Light, shadows, beam and the sun badge follow the moment.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getSource("shadows")) return;
    const { azimuth: az, altitude: alt } = sun;
    const up = alt > 0.5;
    map.setLight({
      anchor: "map",
      position: [1.5, az, Math.min(88, Math.max(4, 90 - alt))],
      // Warmer only near the horizon, and gently: the massing stays readable.
      color: alt < 12 ? "#ffe0c0" : "#fff8ee",
      intensity: up ? 0.25 + 0.3 * Math.sin(alt * rad) : 0.12,
    });

    const shadows: GeoJSON.Feature[] = [];
    if (up) {
      const len = (h: number) => Math.min(h / Math.tan(alt * rad), 600);
      const dir: Pt = [-Math.sin(az * rad), -Math.cos(az * rad)];
      for (const b of buildingsRef.current) {
        const l = len(b.h);
        const pts = b.ring.map(local2);
        const swept = pts.concat(pts.map(([x, y]) => [x + dir[0] * l, y + dir[1] * l] as Pt));
        const h = hull(swept).map(([x, y]) => at(x, y));
        if (h.length > 2) shadows.push({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...h, h[0]]] } });
      }
    }
    (map.getSource("shadows") as GeoJSONSource).setData({ type: "FeatureCollection", features: shadows });

    const tip = onDisc(az, alt);
    (map.getSource("beam") as GeoJSONSource).setData(
      up
        ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [site.coords, at(Math.sin(az * rad) * RING * 1.7, Math.cos(az * rad) * RING * 1.7)] } }
        : { type: "FeatureCollection", features: [] },
    );
    const badge = markersRef.current.sun;
    if (badge) {
      badge.setLngLat(tip);
      badge.getElement().textContent = clock(minutes);
      badge.getElement().style.opacity = up ? "1" : "0";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sun, ready, minutes, built]);

  // Play runs the day from sunrise to sunset in about twelve seconds.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setMinutes((m) => {
        if (m >= times.set) {
          setPlaying(false);
          return times.set;
        }
        return Math.min(times.set, Math.max(times.rise, m) + 4);
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [playing, times]);

  const dateText = `${day.getUTCDate()} ${(lang === "ka" ? MONTHS_KA : MONTHS)[day.getUTCMonth()]} ${year}`;
  const daylight = times.set - times.rise;
  const toNow = () => {
    const l = new Date(Date.now() + UTC_OFFSET * 3_600_000);
    setDoy(Math.floor((l.valueOf() - Date.UTC(year, 0, 1)) / 86_400_000));
    setMinutes(l.getUTCHours() * 60 + l.getUTCMinutes());
  };

  const body = (
    <>
      {/* Inline position: MapLibre's stylesheet sets its container to position: relative. */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      {sun.altitude <= 0.5 && <div className="pointer-events-none absolute inset-0 bg-[#0c1a2a]/45" aria-hidden />}

      <section
        aria-label={t("Time and date", "დრო და თარიღი")}
        className="glass glass-dark absolute left-4 right-4 top-4 rounded-[24px] p-5 text-white md:left-auto md:right-6 md:top-6 md:w-[380px]"
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow text-white/85">
            {t("Sun study", "მზის კვლევა")} · {place ?? t("SEU Varketili", "SEU ვარკეთილი")}
          </p>
          <button ref={closeRef} type="button" onClick={onClose} data-autofocus aria-label={t("Close sun study", "მზის კვლევის დახურვა")} className="btn btn-icon btn-sm h-10 w-10 border-white/40 text-white">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <p>
            <span className="title-display block text-[44px] leading-none tabular-nums">{clock(minutes)}</span>
            <span className="mt-1 block text-[12px] uppercase tracking-[0.16em] text-white/75">{dateText} · UTC+4</span>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={toNow} className="btn btn-sm border-white/40 text-white">
              {t("Now", "ახლა")}
            </button>
            <button
              type="button"
              aria-pressed={playing}
              aria-label={playing ? t("Pause the day", "დღის შეჩერება") : t("Play the day", "დღის დაკვრა")}
              onClick={() => {
                if (!playing && minutes >= times.set) setMinutes(times.rise);
                setPlaying(!playing);
              }}
              className="btn btn-icon btn-sm h-10 w-10 border-white/40 text-white aria-pressed:bg-seu-accent"
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
                {playing ? <path d="M1 1h3v12H1zM8 1h3v12H8z" /> : <path d="M1 1l10 6-10 6z" />}
              </svg>
            </button>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="flex justify-between text-[12px] text-white/75">
            <span>
              {t("Sunrise", "მზის ამოსვლა")} {clock(times.rise)}
            </span>
            <span>
              {t("Sunset", "მზის ჩასვლა")} {clock(times.set)}
            </span>
          </span>
          <input
            type="range"
            className="sun-range mt-2 w-full"
            min={times.rise}
            max={times.set}
            step={5}
            value={Math.min(times.set, Math.max(times.rise, minutes))}
            aria-label={t("Time of day", "დღის დრო")}
            aria-valuetext={clock(minutes)}
            onChange={(e) => {
              setPlaying(false);
              setMinutes(+e.target.value);
            }}
          />
        </label>
        <label className="mt-4 block">
          <span className="flex justify-between text-[12px] text-white/75">
            <span>{t("1 Jan", "1 იან")}</span>
            <span>{t("31 Dec", "31 დეკ")}</span>
          </span>
          <input
            type="range"
            className="sun-range sun-range--date mt-2 w-full"
            min={0}
            max={364}
            value={doy}
            aria-label={t("Date", "თარიღი")}
            aria-valuetext={dateText}
            onChange={(e) => setDoy(+e.target.value)}
          />
        </label>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4 text-[12px]">
          <div>
            <dt className="text-white/70">{t("Altitude", "სიმაღლე")}</dt>
            <dd className="mt-1 text-[16px] tabular-nums">{Math.max(0, Math.round(sun.altitude))}°</dd>
          </div>
          <div>
            <dt className="text-white/70">{t("Direction", "მიმართულება")}</dt>
            <dd className="mt-1 text-[16px] tabular-nums">
              {Math.round(sun.azimuth)}° {(lang === "ka" ? COMPASS_KA : COMPASS)[Math.round(sun.azimuth / 45) % 8]}
            </dd>
          </div>
          <div>
            <dt className="text-white/70">{t("Daylight", "დღის ხანგრძლივობა")}</dt>
            <dd className="mt-1 text-[16px] tabular-nums">
              {Math.floor(daylight / 60)}{t("h", "სთ")} {daylight % 60}{t("m", "წთ")}
            </dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-4 text-[12px] text-white/75">
          <span className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded bg-[#f2c230]" /> {t("Today", "დღეს")}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dashed border-white" /> {t("June / December", "ივნისი / დეკემბერი")}
          </span>
        </p>
      </section>
    </>
  );

  if (variant === "sheet")
    return (
      <Sheet open onClose={onClose} label={`${t("Sun study", "მზის კვლევა")}${place ? `, ${place}` : ""}, ${t("SEU Varketili", "SEU ვარკეთილი")}`} bodyClassName="relative h-[86svh] overflow-hidden bg-seu-ink">
        {body}
      </Sheet>
    );

  // Portalled to <body>: above the site header and clear of any transformed section.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("Sun study, SEU Varketili", "მზის კვლევა, SEU ვარკეთილი")} className="tone-dark fixed inset-0 z-[400] bg-seu-ink" data-lenis-prevent>
      {body}
    </div>,
    document.body,
  );
}
