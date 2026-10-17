"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withBase } from "@/data/projects";
import { bedroomsIn, blockNameIn, deliveryIn, units, unitsOn, varketiliBlocks, type Block } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import Icon from "@/components/ui/Icon";
import SearchPill, { OptionList } from "@/components/search/SearchPill";

// The 3D sun study loads its map only when opened.
const SunStudy = dynamic(() => import("./SunStudy"), { ssr: false });

// SEU Varketili from the air at dusk: the developer's own photograph, cleaned up and relit
// with Kling / Gemini 3 Pro (composition and buildings untouched). Source: media/aerial.
const RENDER = "/images/varketili-aerial.jpg";
// Sharper copy for the close-up of one block; fetched only when a block is opened.
const RENDER_4K = "/images/varketili-aerial-4k.jpg";
const RATIO = 5504 / 3072;
// The photograph is a little taller than the screen and hangs from the top, so the empty
// houses at its foot are cropped; FOCUS is the share of its width kept in the middle of the
// screen (the centre of the five blocks).
const ZOOM = 1.25;
const FOCUS = 0.43;

/*
 * Facades measured on the photograph, in percent of the image. Each part is one face of a
 * block as four corners (roof line left and right, then the foot of the lowest storey right
 * and left), so slanted storey lines of the aerial view follow the picture. Storeys count
 * down from the roof: the top band is the block's highest floor.
 */
type Pt = [number, number];
type Part = { tl: Pt; tr: Pt; br: Pt; bl: Pt };
const FACADES: Record<string, Part[]> = {
  v2: [
    { tl: [10.81, 58.25], tr: [13.74, 60.56], br: [14.95, 79.1], bl: [12.02, 76.76] },
    { tl: [13.74, 60.56], tr: [22.93, 53.44], br: [23.33, 71.7], bl: [14.95, 79.1] },
  ],
  v3: [
    { tl: [29.52, 48.6], tr: [34.03, 52.04], br: [34.03, 59.6], bl: [29.52, 56.1] },
    { tl: [34.03, 52.04], tr: [36.47, 49.65], br: [36.47, 56.9], bl: [34.03, 59.6] },
  ],
  v4: [
    { tl: [36.58, 42.67], tr: [39.55, 43.88], br: [39.55, 54], bl: [36.58, 52.86] },
    { tl: [39.55, 43.88], tr: [41.56, 42.81], br: [41.56, 53], bl: [39.55, 54] },
  ],
  v6: [
    { tl: [45.02, 27.72], tr: [47.97, 29.08], br: [47.97, 42.6], bl: [45.02, 41.12] },
    { tl: [47.97, 29.08], tr: [54.8, 29], br: [54.8, 42.6], bl: [47.97, 42.6] },
  ],
  v7: [
    { tl: [70.06, 37.9], tr: [72.55, 35.04], br: [72.55, 44.14], bl: [69.79, 47.18] },
    { tl: [72.55, 35.04], tr: [76.18, 34.66], br: [76.03, 43.7], bl: [72.55, 44.14] },
  ],
};

/**
 * Evening close-up of each block (Kling / Gemini 3 Pro from the aerial photograph), shown
 * once the camera has flown in. `faces` are measured on that picture like FACADES above.
 */
type Closeup = { image: string; ratio: number; faces: Part[] };
const CLOSEUPS: Partial<Record<string, Closeup>> = {
  v2: {
    image: "/images/closeup-v2.webp",
    ratio: RATIO,
    faces: [
      { tl: [31.9, 26.5], tr: [61.25, 6.7], br: [61.25, 82.5], bl: [31.9, 80] },
      { tl: [61.25, 6.7], tr: [68.1, 18.5], br: [68.1, 78.4], bl: [61.25, 82.5] },
    ],
  },
  v3: { image: "/images/closeup-v3.webp", ratio: RATIO, faces: [{ tl: [28.7, 27.3], tr: [72.5, 27.3], br: [72.5, 78.5], bl: [28.7, 78.5] }] },
  v4: {
    image: "/images/closeup-v4.webp",
    ratio: RATIO,
    faces: [
      { tl: [31.9, 18.8], tr: [46.1, 12.8], br: [46.1, 85], bl: [31.9, 79.5] },
      { tl: [46.1, 9.5], tr: [67.2, 16.8], br: [67.2, 80], bl: [46.1, 88] },
    ],
  },
  v6: {
    image: "/images/closeup-v6.webp",
    ratio: RATIO,
    faces: [
      { tl: [27.4, 21.5], tr: [40.9, 15.3], br: [40.6, 84.3], bl: [27.3, 83.2] },
      { tl: [40.9, 15.3], tr: [72.5, 21.5], br: [72.5, 83.2], bl: [40.6, 84.3] },
    ],
  },
  v7: {
    image: "/images/closeup-v7.webp",
    ratio: RATIO,
    faces: [
      { tl: [25.2, 21], tr: [56.3, 27], br: [56.3, 78.5], bl: [25.2, 81] },
      { tl: [56.3, 27], tr: [75.3, 27], br: [75.3, 77.5], bl: [56.3, 78.5] },
    ],
  },
};

/** Where each block's pin stands: the highest point of its roof, in percent of the image. */
const PINS: Record<string, { x: number; y: number }> = {
  v2: { x: 18.6, y: 52.8 },
  v3: { x: 32.7, y: 49.4 },
  v4: { x: 38.9, y: 42.1 },
  v6: { x: 49.5, y: 27.3 },
  v7: { x: 73.9, y: 34 },
};

/** A block's outline on the photo (its faces and pin), in percent: left, top, right, bottom. */
function bounds(id: string) {
  const pts = [...FACADES[id].flatMap((q) => [q.tl, q.tr, q.br, q.bl]), [PINS[id].x, PINS[id].y] as Pt];
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Outline of one floor across one facade part, as SVG polygon points. */
function band(p: Part, floors: number, floor: number) {
  const t0 = (floors - floor) / floors;
  const t1 = t0 + 1 / floors;
  return [mix(p.tl, p.bl, t0), mix(p.tr, p.br, t0), mix(p.tr, p.br, t1), mix(p.tl, p.bl, t1)];
}

const floorHref = (b: Block, floor: number) => `/projects/varketili/${b.id}/?floor=${Math.max(2, floor)}`;

type Hover = { block: Block; floor: number; match?: number; docked?: boolean };

/** The hero's own filter: it lights up matching floors on the render instead of leaving the page. */
type Filter = { block: string; from: string; to: string; rooms: number[] };
const NONE: Filter = { block: "", from: "", to: "", rooms: [] };
const SIZES: [string, string][] = [["", "50"], ["50", "70"], ["70", "90"], ["90", ""]];

export default function BlockPicker() {
  const [hover, setHover] = useState<Hover | null>(null);
  const [sun, setSun] = useState(false);
  const sunButton = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const [f, setF] = useState<Filter>(NONE);
  // `peek`: the block whose pin is under the pointer (its card shows). `focus`: the block the
  // camera has flown to, as era.estate opens one building from the overview.
  const [peek, setPeek] = useState<Block | null>(null);
  const [focus, setFocus] = useState<Block | null>(null);
  const [camera, setCamera] = useState("none");
  const [sharp, setSharp] = useState(false);
  // The close-up picture fades in once the flight has landed.
  const [landed, setLanded] = useState(false);
  // Cards follow a real pointer only: on touch a tap opens the block or the floor directly.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = !!(f.block || f.from || f.to || f.rooms.length);

  // Available flats that fit the filter, counted per floor ("v4-7") and per block ("v4").
  const hits = useMemo(() => {
    const map = new Map<string, number>();
    if (!active) return map;
    const from = f.from ? Number(f.from) : null;
    const to = f.to ? Number(f.to) : null;
    units.forEach((u) => {
      if (u.project !== "varketili" || u.status !== "available") return;
      if (f.block && u.block !== f.block) return;
      if (f.rooms.length && !f.rooms.includes(Math.min(u.bedrooms, 3))) return;
      if ((from !== null && u.totalArea < from) || (to !== null && u.totalArea > to)) return;
      for (const k of [`${u.block}-${u.floor}`, u.block, ""]) map.set(k, (map.get(k) ?? 0) + 1);
    });
    return map;
  }, [f, active]);
  const total = hits.get("") ?? 0;
  const floorsLit = [...hits.keys()].filter((k) => k.includes("-")).length;

  const m2 = t("m²", "მ²");
  const sizeText = (from: string, to: string) =>
    from && to ? `${from}–${to} ${m2}` : from ? t(`From ${from} ${m2}`, `${from} ${m2}-დან`) : to ? t(`Up to ${to} ${m2}`, `${to} ${m2}-მდე`) : t("Any size", "ნებისმიერი");
  const roomLabel = (r: number) => (r === 0 ? t("Studio", "სტუდიო") : r === 3 ? "3+" : String(r));
  const blockOptions = [{ value: "", label: t("All blocks", "ყველა ბლოკი") }, ...varketiliBlocks.map((b) => ({ value: b.id, label: blockNameIn(b, lang) }))];

  // On narrow screens the photo is wider than the viewport: start on the blocks, let people swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth * FOCUS - el.clientWidth / 2;
  }, []);

  /** Fly the camera to one block: it fills the space under the heading, the rest dims. */
  const open = (b: Block) => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;
    const sr = section.getBoundingClientRect();
    const r = stage.getBoundingClientRect();
    const [x0, y0, x1, y1] = bounds(b.id);
    const wide = sr.width >= 1024;
    const top = wide ? 200 : 300;
    const room = { w: wide ? sr.width * 0.42 : sr.width * 0.9, h: sr.height - top - 48 };
    const box = { w: ((x1 - x0) / 100) * r.width, h: ((y1 - y0) / 100) * r.height };
    const scale = Math.min(room.w / box.w, room.h / box.h, 3.2);
    const cx = ((x0 + x1) / 200) * r.width;
    const cy = ((y0 + y1) / 200) * r.height;
    // Screen position of a stage point p: stage offset + translate + scale * p.
    const tx = (wide ? sr.width * 0.4 : sr.width / 2) - (r.left - sr.left) - scale * cx;
    const ty = top + room.h / 2 - (r.top - sr.top) - scale * cy;
    setCamera(`translate(${tx}px, ${ty}px) scale(${scale})`);
    setFocus(b);
    setLanded(false);
    const shot = CLOSEUPS[b.id];
    if (shot) new Image().src = withBase(shot.image);
    setPeek(null);
    setHover(null);
    if (!sharp) {
      const img = new Image();
      img.onload = () => setSharp(true);
      img.src = withBase(RENDER_4K);
    }
  };
  const close = () => {
    setLanded(false);
    setFocus(null);
    setCamera("none");
    setHover(null);
  };

  useEffect(() => {
    if (!focus) return;
    const timer = window.setTimeout(() => setLanded(true), 950);
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    // The flight is worked out for this window size; a new size returns to the overview.
    const resize = () => close();
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
    };
  }, [focus]);

  const shot = focus ? CLOSEUPS[focus.id] : undefined;

  return (
    <section ref={sectionRef} data-tone="dark" className="tone-dark relative h-[100svh] min-h-[680px] overflow-hidden bg-seu-ink">
      <div ref={scrollerRef} className={`absolute inset-0 overflow-y-hidden lg:overflow-hidden ${focus ? "overflow-x-hidden" : "overflow-x-auto"}`}>
        {/* The render covers the stage at its own aspect; floors and pins share its coordinate box. */}
        <div
          ref={stageRef}
          // On phones the photo starts below the heading and the pill so roofs and pins stay clear.
          className="absolute left-0 top-[300px] [--stage-h:calc(max(100svh,680px)-300px)] lg:left-[calc(50%-var(--box-w)*var(--focus))] lg:top-0 lg:[--stage-h:max(100svh,680px)]"
          style={
            {
              "--box-w": `max(100%, calc(var(--stage-h) * ${ZOOM * RATIO}))`,
              "--focus": FOCUS,
              aspectRatio: `${RATIO}`,
              width: "var(--box-w)",
              transform: camera,
              transformOrigin: "0 0",
              transition: "transform 1.1s cubic-bezier(0.7, 0, 0.2, 1)",
            } as React.CSSProperties
          }
          onMouseLeave={() => setHover(null)}
        >
          <img fetchPriority="high" src={withBase(sharp && focus ? RENDER_4K : RENDER)} alt={t("SEU Varketili from the air at dusk: five residential blocks", "SEU ვარკეთილი ზემოდან, საღამოს: ხუთი საცხოვრებელი ბლოკი")} className="h-full w-full" />
          {/* Phones: the sky melts into the dark band under the heading instead of a hard edge. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-seu-ink to-transparent lg:hidden" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" data-cursor="native">
            {/* Close-up: everything but the open block sinks into shade. */}
            <path
              d={`M-50,-50H150V150H-50Z${focus ? FACADES[focus.id].map((q) => `M${[q.tl, q.tr, q.br, q.bl].map((pt) => pt.join(",")).join("L")}Z`).join("") : ""}`}
              fillRule="evenodd"
              fill="#0c1613"
              fillOpacity={focus ? 0.5 : 0}
              style={{ transition: "fill-opacity .8s ease-out" }}
              pointerEvents="none"
            />
            {varketiliBlocks.map((b) =>
              Array.from({ length: b.floors }, (_, i) => {
                const floor = i + 1;
                const on = hover?.block.id === b.id && hover.floor === floor;
                const inBlock = hover?.block.id === b.id || peek?.id === b.id;
                const away = !!focus && focus.id !== b.id;
                const match = hits.get(`${b.id}-${floor}`) ?? 0;
                return (
                  <a
                    key={`${b.id}-${floor}`}
                    href={withBase(h(floorHref(b, floor)))}
                    tabIndex={-1}
                    aria-hidden
                    onMouseEnter={() => setHover({ block: b, floor, match: active ? match : undefined })}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(h(floorHref(b, floor)));
                    }}
                    // Mouse-only shortcut (keyboard goes through the pins): no focus ring on click.
                    className={`cursor-pointer outline-none ${away ? "pointer-events-none opacity-0" : ""}`}
                  >
                    {FACADES[b.id].map((p, k) => (
                      <polygon
                        key={k}
                        points={band(p, b.floors, floor).map((pt) => pt.join(",")).join(" ")}
                        // Filtered: matching floors glow as light bands and the rest sink into a
                        // little shade; the floor under the pointer turns copper.
                        fill={on ? "#e07a3a" : match ? "#fff6ea" : active ? "#0c1613" : "#fff"}
                        fillOpacity={on ? (match ? 0.65 : 0.5) : match ? 0.42 : active ? 0.22 : inBlock ? 0.1 : 0}
                        stroke="#fffaf3"
                        strokeOpacity={match ? 0.9 : 0}
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        // Matching floors light up block by block, bottom to top; hover answers at once.
                        style={{
                          transition: "fill-opacity .3s ease-out, fill .3s ease-out, stroke-opacity .3s ease-out",
                          transitionDelay: match && !hover ? `${varketiliBlocks.indexOf(b) * 50 + floor * 15}ms` : "0ms",
                        }}
                      />
                    ))}
                  </a>
                );
              }),
            )}
          </svg>

          {varketiliBlocks.map((b, i) => {
            const pin = PINS[b.id];
            const found = hits.get(b.id) ?? 0;
            // A badge on a hairline stem, its foot dot resting on the roof.
            return (
              <button
                key={b.id}
                type="button"
                aria-label={
                  t(`${b.name}, ${b.floors} floors: open the block`, `${blockNameIn(b, lang)}, ${b.floors} სართული: ბლოკის გახსნა`) +
                  (active ? t(`. ${found} matching apartments`, `. ${found} შესაბამისი ბინა`) : "")
                }
                onClick={() => open(b)}
                onMouseEnter={() => setPeek(b)}
                onMouseLeave={() => setPeek(null)}
                onFocus={() => setPeek(b)}
                onBlur={() => setPeek(null)}
                tabIndex={focus ? -1 : 0}
                className={`group absolute -translate-x-1/2 -translate-y-full transition-opacity duration-300 ${focus ? "pointer-events-none opacity-0" : ""}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span className="block-pin flex flex-col items-center" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                  <span className="label grid h-10 w-10 place-items-center rounded-full bg-seu-ink/85 text-[14px] text-white ring-1 ring-white/60 backdrop-blur transition-colors group-hover:bg-seu-accent group-focus-visible:bg-seu-accent">
                    {b.id.slice(1)}
                  </span>
                  <span className="h-7 w-px bg-white/80" />
                  <span className="-mb-[3px] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255/0.25)]" />
                </span>
              </button>
            );
          })}

          {canHover && peek && !focus && <BlockCard block={peek} />}
          {canHover && hover && !focus && <FloorCard {...hover} />}
        </div>
      </div>
      {/* The open block's own evening close-up, over the zoomed photo, with its floors. */}
      {focus && shot && (
        <div className={`absolute inset-0 overflow-hidden bg-seu-ink transition-opacity duration-700 ${landed ? "opacity-100" : "pointer-events-none opacity-0"}`} style={{ containerType: "size" }} onMouseLeave={() => setHover(null)}>
          <div
            // Wide screens: the picture covers the stage with the building left of centre, clear of
            // the floor card on the right (so it is at least 116% wide). Phones: a band under the
            // search pill, wide enough to show the whole building.
            className="absolute left-1/2 top-[330px] w-[200cqw] -translate-x-1/2 lg:left-[42%] lg:top-1/2 lg:w-[var(--cover)] lg:-translate-y-1/2"
            style={{ aspectRatio: `${shot.ratio}`, "--cover": `max(116cqw, calc(100cqh * ${shot.ratio}))` } as React.CSSProperties}
          >
            <img src={withBase(shot.image)} alt={t(`${focus.name} in the evening`, `${blockNameIn(focus, lang)} საღამოს`)} className="h-full w-full" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" data-cursor="native">
              {Array.from({ length: focus.floors }, (_, i) => {
                const floor = i + 1;
                const on = hover?.floor === floor;
                const match = hits.get(`${focus.id}-${floor}`) ?? 0;
                return (
                  <a
                    key={floor}
                    href={withBase(h(floorHref(focus, floor)))}
                    tabIndex={-1}
                    aria-hidden
                    onMouseEnter={() => setHover({ block: focus, floor, match: active ? match : undefined })}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(h(floorHref(focus, floor)));
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {shot.faces.map((p, k) => (
                      <polygon
                        key={k}
                        points={band(p, focus.floors, floor).map((pt) => pt.join(",")).join(" ")}
                        fill={on ? "#e07a3a" : match ? "#fff6ea" : active ? "#0c1613" : "#fff"}
                        fillOpacity={on ? (match ? 0.6 : 0.45) : match ? 0.36 : active ? 0.2 : 0}
                        stroke="#fffaf3"
                        strokeOpacity={match ? 0.85 : 0}
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        style={{ transition: "fill-opacity .3s ease-out, fill .3s ease-out, stroke-opacity .3s ease-out" }}
                      />
                    ))}
                  </a>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Shade under the title and a short fade into the page below; the render stays bright between. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-seu-ink/85 via-seu-ink/45 to-transparent" />
      {/* A softer shade in the corner under the heading and its links. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-[radial-gradient(60%_80%_at_0%_10%,rgb(12_22_19/0.85),transparent_72%)] max-md:bg-[radial-gradient(130%_75%_at_0%_10%,rgb(12_22_19/0.85),transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-seu-bg to-transparent" />

      {/* Close-up: the floor under the pointer is described in a card docked at the side. */}
      {canHover && focus && hover && <FloorCard {...hover} docked />}

      {/* Compact heading, as on era.estate: the buildings carry the screen. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-[1680px] px-gutter pt-28 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {/* Navigation reads as a quiet text link. */}
        <div className={`flex flex-wrap items-center gap-6 ${focus ? "hidden" : ""}`}>
          <Link href={h("/projects/")} className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-seu-ink/55 backdrop-blur transition-colors group-hover:border-white group-hover:bg-seu-ink/80">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="[text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">{t("All projects", "ყველა პროექტი")}</span>
          </Link>
        </div>
        {/* Close-up of one block: back to the overview, and the floor plans for keyboard users. */}
        {focus && (
          <div className="flex flex-wrap items-center gap-6">
            <button type="button" onClick={close} className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-seu-ink/55 backdrop-blur transition-colors group-hover:border-white group-hover:bg-seu-ink/80">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                  <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <span className="[text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">{t("All blocks", "ყველა ბლოკი")}</span>
            </button>
            <Link href={h(`/projects/varketili/${focus.id}/`)} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white underline decoration-white/40 underline-offset-[6px] transition-colors hover:decoration-white">
              {t("Floor plans", "სართულების გეგმები")}
            </Link>
          </div>
        )}
        <p className="eyebrow mt-8 text-white/85">
          {focus ? t("SEU Varketili · Choose a floor", "SEU ვარკეთილი · აირჩიეთ სართული") : t("Visual search · Choose a floor", "ვიზუალური ძებნა · აირჩიეთ სართული")}
        </p>
        <h1 className={`title-display mt-3 text-[clamp(32px,3.4vw,56px)] uppercase leading-none ${focus ? "hidden" : ""}`} data-split>
          {t("SEU Varketili", "SEU ვარკეთილი")}<span className="text-seu-accent-hi">.</span>
        </h1>
        {focus && (
          <p key={focus.id} className="barrel-in title-display mt-3 text-[clamp(32px,3.4vw,56px)] uppercase leading-none" aria-live="polite">
            {blockNameIn(focus, lang)}
            <span className="text-seu-accent-hi">.</span>
          </p>
        )}

        {/* One long pill in the sky above the roofs, as on the apartment search; it filters in place. */}
        <div className="pointer-events-auto mt-6 lg:absolute lg:right-gutter lg:top-[100px] lg:mt-0 lg:w-[min(720px,calc(100%-480px))]">
          <SearchPill
            className="vars-light flex"
            label={t("Find an apartment in SEU Varketili", "ბინის ძებნა SEU ვარკეთილში")}
            segments={[
              {
                id: "block",
                icon: "building",
                label: t("Block", "ბლოკი"),
                value: blockOptions.find((o) => o.value === f.block)?.label ?? "",
                set: !!f.block,
                className: "max-xl:hidden",
                panel: (close) => (
                  <OptionList
                    options={blockOptions}
                    value={f.block}
                    onPick={(v) => {
                      setF((d) => ({ ...d, block: v }));
                      close();
                    }}
                  />
                ),
              },
              {
                id: "size",
                icon: "area",
                label: t("Size", "ზომა"),
                value: sizeText(f.from, f.to),
                set: !!(f.from || f.to),
                // Phones: panels hang from the whole pill so they stay on screen.
                className: "max-md:static",
                panel: () => (
                  <div className="w-[min(300px,calc(100vw-48px))] p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-seu-muted">{t("From, m²", "დან, მ²")}</span>
                        <input className="field" inputMode="numeric" value={f.from} onChange={(e) => setF((d) => ({ ...d, from: e.target.value.replace(/\D/g, "") }))} />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-[12px] font-semibold text-seu-muted">{t("To, m²", "მდე, მ²")}</span>
                        <input className="field" inputMode="numeric" value={f.to} onChange={(e) => setF((d) => ({ ...d, to: e.target.value.replace(/\D/g, "") }))} />
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SIZES.map(([a, b]) => (
                        <button key={a + b} type="button" aria-pressed={f.from === a && f.to === b} onClick={() => setF((d) => ({ ...d, from: a, to: b }))} className="chip rounded-full px-3.5 [--ctl-h:44px]">
                          {sizeText(a, b)}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                id: "rooms",
                icon: "bed",
                label: t("Bedrooms", "საძინებლები"),
                value: f.rooms.length ? [...f.rooms].sort().map(roomLabel).join(", ") : t("Any", "ნებისმიერი"),
                set: f.rooms.length > 0,
                className: "max-md:static",
                panel: () => (
                  <div className="grid w-[min(300px,calc(100vw-48px))] grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 p-4">
                    {[0, 1, 2, 3].map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={f.rooms.includes(r)}
                        onClick={() => setF((d) => ({ ...d, rooms: d.rooms.includes(r) ? d.rooms.filter((x) => x !== r) : [...d.rooms, r] }))}
                        className="chip px-0"
                      >
                        {roomLabel(r)}
                      </button>
                    ))}
                  </div>
                ),
              },
            ]}
            end={
              <span className="tip ml-1 shrink-0 self-center" data-tip={t("Clear filter", "ფილტრის გასუფთავება")}>
                <button
                  type="button"
                  onClick={() => setF(NONE)}
                  disabled={!active}
                  aria-label={t("Clear filter", "ფილტრის გასუფთავება")}
                  className="grid h-12 w-12 place-items-center rounded-full bg-seu-ink text-white transition-opacity hover:bg-seu-ink/85 disabled:bg-seu-ink/10 disabled:text-seu-ink/35 lg:h-14 lg:w-14"
                >
                  <Icon name="reset" size={18} />
                </button>
              </span>
            }
          />
          {/* What the render now shows, in words (also read out). */}
          <p role="status" className="mt-3 flex items-center gap-2 text-[14px] text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.55)] lg:justify-end">
            {active ? (
              <>
                <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${total ? "bg-[#ffd7b5] shadow-[0_0_0_3px_rgb(255_215_181/0.3)]" : "bg-white/40"}`} />
                {total
                  ? t(`${total} apartments on ${floorsLit} floors, lit on the buildings`, `${total} ბინა ${floorsLit} სართულზე — მონიშნულია შენობებზე`)
                  : t("No free apartments match: try a wider range", "ამ ფილტრით თავისუფალი ბინა ვერ მოიძებნა — სცადეთ უფრო ფართო")}
              </>
            ) : (
              t("Pick a size or bedrooms: matching floors light up", "აირჩიეთ ზომა ან საძინებლები — შესაბამისი სართულები განათდება")
            )}
          </p>
        </div>
      </div>

      {/* Sun study: one round button in the corner, on its own soft shade so it never melts into
          the trees; its name shows on hover and focus. */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-10 h-[260px] w-[360px] bg-[radial-gradient(closest-side_at_75%_75%,rgb(12_22_19/0.7),transparent)]" />
      <div className="absolute bottom-8 right-5 z-10 md:bottom-10 md:right-gutter">
        <span className="tip tip--up block" data-tip={t("Sun study", "მზის კვლევა")}>
          <button
            ref={sunButton}
            type="button"
            aria-haspopup="dialog"
            aria-label={t("Sun study", "მზის კვლევა")}
            onClick={() => setSun(true)}
            className="grid h-14 w-14 place-items-center rounded-full bg-seu-ink/90 text-white shadow-[0_0_0_6px_rgb(12_22_19/0.25),0_12px_32px_rgb(0_0_0/0.45)] ring-1 ring-white/70 backdrop-blur-md transition-colors hover:bg-seu-accent focus-visible:bg-seu-accent"
          >
            <SunIcon />
          </button>
        </span>
      </div>
      {sun && (
        <SunStudy
          onClose={() => {
            setSun(false);
            sunButton.current?.focus();
          }}
        />
      )}
    </section>
  );
}

/**
 * Block card, as era.estate shows over a pin: the free flats in large figures, their sizes,
 * the number of floors and the completion date. Beside the pin, on whichever side has room.
 */
function BlockCard({ block }: { block: Block }) {
  const pin = PINS[block.id];
  const free = units.filter((u) => u.block === block.id && u.status === "available");
  const sizes = free.map((u) => u.totalArea);
  const flip = pin.x > 60;
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  return (
    <div
      aria-hidden
      className="barrel-in tone-light pointer-events-none absolute z-20 w-[280px] rounded-[20px] p-6 shadow-[0_30px_70px_rgb(0_0_0/0.35)]"
      style={{ top: `${pin.y}%`, ...(flip ? { right: `calc(${100 - pin.x}% + 34px)` } : { left: `calc(${pin.x}% + 34px)` }), transform: "translateY(-30%)" }}
    >
      <div className="flex items-start gap-4">
        <span className="title-display text-[64px] leading-[0.85]">{free.length}</span>
        <span className="label mt-1 text-[12px] uppercase tracking-[0.16em]">{t("Apartments available", "ბინა ხელმისაწვდომია")}</span>
      </div>
      {sizes.length > 0 && (
        <p className="mt-5 text-[16px] font-semibold">
          {Math.round(Math.min(...sizes))}–{Math.round(Math.max(...sizes))} {t("m²", "მ²")}
        </p>
      )}
      <p className="mt-1 text-[14px] text-seu-muted">
        {blockNameIn(block, lang)} · {t(`${block.floors} floors`, `${block.floors} სართული`)}
      </p>
      <div className="mt-5 border-t border-seu-line pt-4">
        <p className="text-[12px] uppercase tracking-[0.14em] text-seu-muted">{block.status === "delivered" ? t("Delivered", "ჩაბარდა") : t("Completion", "დასრულება")}</p>
        <p className="mt-1 text-[14px] font-semibold">{deliveryIn(block.delivery, lang)}</p>
      </div>
    </div>
  );
}

/**
 * Floor card, as on era.estate: the floor and block in large figures, delivery, then what is
 * still available on that floor by flat type. Sits beside the facade,
 * on whichever side has room.
 */
function FloorCard({ block, floor, match, docked }: Hover) {
  const parts = FACADES[block.id];
  const p = parts[parts.length - 1];
  const left = Math.min(...parts.flatMap((q) => [q.tl[0], q.bl[0]]));
  const right = Math.max(...parts.flatMap((q) => [q.tr[0], q.br[0]]));
  // Level with the floor's band where it meets the facade's right edge.
  const y = mix(p.tr, p.br, (block.floors - floor + 0.5) / block.floors)[1];
  const flip = right > 66;
  const all = unitsOn(block.id, floor);
  const total = all.length;
  const free = all.filter((u) => u.status === "available");
  const types = [...new Set(free.map((u) => u.bedrooms))].sort((a, b) => a - b);
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  return (
    <div
      aria-hidden
      className={`tone-light pointer-events-none absolute z-20 w-[300px] rounded-[20px] p-6 shadow-[0_30px_70px_rgb(0_0_0/0.35)] ${docked ? "barrel-in right-gutter top-[calc(50%+60px)] max-lg:hidden" : ""}`}
      style={
        docked
          ? { transform: "translateY(-50%)" }
          : {
              // The box is ZOOM times the screen height: keep the card inside the visible part.
              top: `clamp(12%, ${y}%, ${56 / ZOOM}%)`,
              ...(flip ? { right: `${100 - left + 1.2}%` } : { left: `${right + 1.2}%` }),
              transform: "translateY(-50%)",
            }
      }
    >
      <div className="grid grid-cols-2 divide-x divide-seu-line">
        <p>
          <span className="title-display block text-[48px] leading-none">{String(floor).padStart(2, "0")}</span>
          <span className="label mt-2 block text-[12px] uppercase tracking-[0.16em]">{t("Floor", "სართული")}</span>
        </p>
        <p className="pl-6">
          <span className="title-display block text-[48px] leading-none">{block.id.slice(1)}</span>
          <span className="label mt-2 block text-[12px] uppercase tracking-[0.16em]">{t("Block", "ბლოკი")}</span>
        </p>
      </div>
      <p className="mt-5 border-t border-seu-line pt-4 text-[12px] uppercase tracking-[0.14em] text-seu-muted">
        {block.status === "delivered" ? t(`Delivered ${block.delivery}`, `ჩაბარდა ${deliveryIn(block.delivery, lang)}`) : t(`Completion ${block.delivery}`, `დასრულება: ${deliveryIn(block.delivery, lang)}`)}
      </p>
      {match !== undefined && floor > 1 && (
        <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-seu-accent">
          <Icon name="search" size={14} strokeWidth={2} />
          {t(`${match} match your filter`, `${match} შეესაბამება ფილტრს`)}
        </p>
      )}
      {floor === 1 ? (
        <p className="mt-3 text-[14px]">{t("Lobby and retail", "ლობი და კომერციული ფართი")}</p>
      ) : types.length ? (
        <>
          <p className="mt-3 text-[14px]">
            {lang === "ka" ? (
              <>
                {total}-დან <span className="font-semibold">{free.length}</span> ბინა ხელმისაწვდომია
              </>
            ) : (
              <>
                <span className="font-semibold">{free.length}</span> of {total} flats available
              </>
            )}
          </p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {types.map((n) => {
              const of = free.filter((u) => u.bedrooms === n);
              return (
                <li key={n} className="grid grid-cols-[1fr_auto] items-baseline gap-3">
                  <span className="font-semibold">{bedroomsIn(n, lang)}</span>
                  <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-white" style={{ background: "var(--seu-available)" }}>
                    {of.length} {t("free", "თავისუფალი")}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-[14px] text-seu-muted">{t("No flats available on this floor", "ამ სართულზე ხელმისაწვდომი ბინა არ არის")}</p>
      )}
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 13h18M5 13a5 5 0 0 1 10 0M10 2v2M3.5 5l1.4 1.4M16.5 5l-1.4 1.4M1 9h2M17 9h2" />
    </svg>
  );
}
