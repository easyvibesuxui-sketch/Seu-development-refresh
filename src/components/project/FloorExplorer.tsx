"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { bedroomText, blockById, statusText, unitsOn, varketiliBlocks, type Unit } from "@/data/inventory";
import ApartmentCard from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import { ArrowButton } from "./ProjectDetails";

/*
 * Typical floor (Kling / Gemini 3 Pro drawing in the site palette): four flats on the north
 * facade facing Hualing, three on the south facing the Tbilisi Sea, a corridor and core
 * between. Outlines per slot measured on public/images/floor-plan.jpg, in percent.
 */
const PLAN = "/images/floor-plan.jpg";
const PLAN_RATIO = 2400 / 1200;
const UNIT_SHAPES: number[][][] = [
  [[2.3, 5], [13.9, 5], [13.9, 44.5], [2.3, 44.5]],
  [[14.4, 5], [31.8, 5], [31.8, 44.5], [14.4, 44.5]],
  [[32.4, 5], [60.7, 5], [60.7, 44.5], [32.4, 44.5]],
  [[61.2, 5], [95.7, 5], [95.7, 49.6], [61.2, 49.6]],
  [[2.3, 55.5], [27.6, 55.5], [27.6, 92], [2.3, 92]],
  [[28, 55.5], [44.5, 55.5], [44.5, 92], [28, 92]],
  [[61.2, 50.4], [95.7, 50.4], [95.7, 92], [61.2, 92]],
];
const centre = (pts: number[][]) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

/*
 * Site plan of SEU Varketili (Kling, from the aerial render): block footprints in percent of
 * public/images/site-plan.jpg; neighbouring buildings stay unlinked.
 */
const SITE = "/images/site-plan.jpg";
const SITE_RATIO = 1440 / 777;
const site = (pts: number[][]) => pts.map(([x, y]) => [x / 0.9, (y - 15) / 0.65]);
const FOOTPRINTS: Record<string, number[][]> = {
  v2: site([[3.8, 25], [9.8, 21.8], [14.8, 39.5], [11.2, 45], [7.4, 42.4], [9.2, 37.5], [5.4, 27.5]]),
  v3: site([[26.6, 39.5], [30.2, 37.5], [33.5, 39.5], [36, 40.5], [39.5, 40.5], [41.5, 42.5], [39, 51], [35.5, 49.5], [33.5, 47.5], [30, 44.5], [26, 43]]),
  v4: site([[46.7, 41], [52.5, 44.5], [49.5, 55], [43.5, 52]]),
  v6: site([[52, 50.5], [57, 51.5], [62, 49], [66, 50.5], [62, 58], [59.5, 56.5], [52, 53.5]]),
  v7: site([[69.5, 51.5], [76, 53], [85, 58], [81.5, 70.5], [75.5, 75.5], [66.5, 72], [68, 64]]),
};

const statusFill: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

/** Opens the floor named in `?floor=` (the visual search links each floor band here). */
function FloorFromQuery({ max, onFloor }: { max: number; onFloor: (f: number) => void }) {
  const wanted = Number(useSearchParams().get("floor"));
  useEffect(() => {
    if (wanted >= 2 && wanted <= max) onFloor(wanted);
  }, [wanted, max, onFloor]);
  return null;
}

export default function FloorExplorer({ blockId }: { blockId: string }) {
  const block = blockById(blockId)!;
  const [floor, setFloor] = useState(Math.min(8, block.floors));
  const [view, setView] = useState<"plan" | "grid">("plan");
  const [hover, setHover] = useState<string | null>(null);
  const [hoverBlock, setHoverBlock] = useState<string | null>(null);
  const [sun, setSun] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const prevFloor = useRef(floor);
  const floorUnits = useMemo(() => unitsOn(blockId, floor), [blockId, floor]);

  // Changing floors slides the plate vertically and rolls the number like a counter drum.
  useEffect(() => {
    const dir = floor > prevFloor.current ? 1 : -1;
    prevFloor.current = floor;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (planRef.current) gsap.fromTo(planRef.current, { yPercent: 18 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    if (numberRef.current) gsap.fromTo(numberRef.current, { yPercent: 100 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
  }, [floor, view]);

  const step = (d: number) => setFloor((f) => Math.min(block.floors, Math.max(2, f + d)));
  const available = floorUnits.filter((u) => u.status === "available").length;

  return (
    <main data-tone="dark" className="tone-dark relative min-h-[100svh] px-gutter pb-section pt-36">
      <Suspense fallback={null}>
        <FloorFromQuery max={block.floors} onFloor={setFloor} />
      </Suspense>
      <div className="flex items-center justify-between">
        <BackLink href="/projects/varketili/" />
        <div className="flex gap-2" role="tablist" aria-label="Layout view">
          {(["plan", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className="chip min-h-11 rounded-full px-5"
            >
              {v === "plan" ? "Floor plan" : "Grid view"}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={sun}
          aria-label="Toggle sun directions"
          onClick={() => setSun(!sun)}
          className="btn btn-icon aria-pressed:border-seu-accent aria-pressed:bg-seu-accent aria-pressed:text-white"
        >
          <svg width="22" height="16" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <path d="M1 13h18M5 13a5 5 0 0 1 10 0M10 2v2M3.5 5l1.4 1.4M16.5 5l-1.4 1.4M1 9h2M17 9h2" />
          </svg>
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[160px_minmax(0,1fr)_300px]">
        <aside aria-label="Block and floor" className="flex flex-row items-center justify-between gap-6 lg:flex-col lg:items-start lg:justify-start">
          <div>
            <p className="eyebrow mb-4">SEU Varketili</p>
            <h1 className="section-title text-[clamp(32px,3vw,52px)]" data-split>
              {block.name}
            </h1>
          </div>
          <div className="flex items-center gap-4 lg:mt-24 lg:flex-col lg:items-start">
            <ArrowButton dir="up" onClick={() => step(1)} label="Floor up" />
            <div className="overflow-hidden">
              <span ref={numberRef} className="page-title block text-[clamp(48px,4vw,72px)] leading-none tabular-nums">
                {floor}
              </span>
              <span className="text-[13px] text-seu-muted">Floor · {available} available</span>
            </div>
            <ArrowButton dir="down" onClick={() => step(-1)} label="Floor down" />
          </div>
        </aside>

        <div className="relative min-h-[420px] overflow-hidden">
          <div ref={planRef}>
            {view === "plan" ? (
              <div className="relative mx-auto w-full max-w-[980px]">
                <p className="label mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">North · Hualing</p>
                <div className="relative" style={{ aspectRatio: `${PLAN_RATIO}` }}>
                  <img src={withBase(PLAN)} alt={`Typical floor plan of ${block.name}`} className="h-full w-full rounded-[16px]" />
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    {floorUnits.map((u) => (
                      <polygon
                        key={u.id}
                        points={UNIT_SHAPES[u.slot].map((pt) => pt.join(",")).join(" ")}
                        fill={statusFill[u.status]}
                        fillOpacity={hover === u.id ? 0.55 : 0.22}
                        stroke={hover === u.id ? "#f6f1e8" : "none"}
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                        style={{ transition: "fill-opacity .3s" }}
                      />
                    ))}
                  </svg>
                  {floorUnits.map((u) => {
                    const [cx, cy] = centre(UNIT_SHAPES[u.slot]);
                    const on = hover === u.id;
                    return (
                      <Link
                        key={u.id}
                        // Sold flats still open their page (layout, sizes); only the call request is off there.
                        href={`/apartments/${u.id}/`}
                        onMouseEnter={() => setHover(u.id)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(u.id)}
                        onBlur={() => setHover(null)}
                        className="absolute"
                        style={{
                          left: `${UNIT_SHAPES[u.slot][0][0]}%`,
                          top: `${UNIT_SHAPES[u.slot][0][1]}%`,
                          width: `${UNIT_SHAPES[u.slot][1][0] - UNIT_SHAPES[u.slot][0][0]}%`,
                          height: `${UNIT_SHAPES[u.slot][2][1] - UNIT_SHAPES[u.slot][0][1]}%`,
                        }}
                        aria-label={`Apartment ${u.number}, ${bedroomText(u.bedrooms)}, ${u.totalArea} m², ${statusText[u.status]}`}
                      >
                        <span
                          className="absolute grid place-items-center rounded-full text-center shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-transform duration-300"
                          style={{
                            left: `${((cx - UNIT_SHAPES[u.slot][0][0]) / (UNIT_SHAPES[u.slot][1][0] - UNIT_SHAPES[u.slot][0][0])) * 100}%`,
                            top: `${((cy - UNIT_SHAPES[u.slot][0][1]) / (UNIT_SHAPES[u.slot][2][1] - UNIT_SHAPES[u.slot][0][1])) * 100}%`,
                            width: "clamp(34px, 5.4vw, 64px)",
                            height: "clamp(34px, 5.4vw, 64px)",
                            background: u.status === "available" ? "#f6f1e8" : statusFill[u.status],
                            color: u.status === "available" ? "#13211d" : "#fff",
                            transform: `translate(-50%, -50%) scale(${on ? 1.12 : 1})`,
                          }}
                        >
                          <span className="leading-tight">
                            <span className="label block text-[11px] font-semibold md:text-[14px]">{u.number}</span>
                            <span className="hidden text-[11px] md:block">{u.bedrooms === 0 ? "Studio" : `${u.bedrooms} bd`}</span>
                          </span>
                        </span>
                        {on && (
                          <span className="label absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full bg-seu-ink/90 px-3 py-1.5 text-[12px] text-white ring-1 ring-white/20">
                            {u.totalArea} m² · {statusText[u.status]}
                            {u.status !== "sold" && ` · $${u.price.toLocaleString("en-US")}`}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <p className="label mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">South · Tbilisi Sea</p>
                {sun && (
                  <svg className="sun-path pointer-events-none absolute -inset-6" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <path d="M-2 70 Q50 -40 102 70" fill="none" stroke="#ffd59a" strokeOpacity=".8" strokeDasharray="1 1.4" vectorEffect="non-scaling-stroke" />
                    <circle r="2" fill="#ffd59a">
                      <animateMotion dur="7s" repeatCount="indefinite" path="M-2 70 Q50 -40 102 70" />
                    </circle>
                  </svg>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {floorUnits.map((u) => (
                  <ApartmentCard key={u.id} unit={u} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-[12px]">
            {(["available", "reserved", "sold"] as const).map((s) => (
              <span key={s} className="label flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusFill[s] }} />
                {statusText[s]}
              </span>
            ))}
          </div>
        </div>

        <aside aria-label="Blocks" className="lg:pt-24">
          <p className="title-display text-[22px] tracking-[0.08em]">Blocks</p>
          <nav aria-label="Choose a block" className="relative mt-3 overflow-hidden rounded-[16px] ring-1 ring-white/15" style={{ aspectRatio: `${SITE_RATIO}` }}>
            <img src={withBase(SITE)} alt="" className="h-full w-full" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {varketiliBlocks.map((b) => (
                <polygon
                  key={b.id}
                  points={FOOTPRINTS[b.id].map((pt) => pt.join(",")).join(" ")}
                  fill={b.id === blockId ? "#e39a62" : "#f6f1e8"}
                  fillOpacity={b.id === blockId ? 0.55 : hoverBlock === b.id ? 0.3 : 0.08}
                  stroke={b.id === blockId ? "#ffd2ad" : "#e39a62"}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: "fill-opacity .25s" }}
                />
              ))}
            </svg>
            {varketiliBlocks.map((b) => {
              const [cx, cy] = centre(FOOTPRINTS[b.id]);
              const here = b.id === blockId;
              return (
                <Link
                  key={b.id}
                  href={`/projects/varketili/${b.id}/`}
                  aria-current={here ? "page" : undefined}
                  aria-label={`${b.name}${here ? " (this block)" : ""}`}
                  onMouseEnter={() => setHoverBlock(b.id)}
                  onMouseLeave={() => setHoverBlock(null)}
                  className={`label absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[12px] ring-1 transition-colors ${
                    here ? "bg-seu-accent text-white ring-white/70" : "bg-seu-ink/85 text-white ring-white/40 hover:bg-seu-accent"
                  }`}
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                >
                  {b.id.slice(1)}
                </Link>
              );
            })}
          </nav>
          <p className="mt-4 text-[13px] text-seu-muted">
            {block.floors} floors · {block.status === "delivered" ? `Delivered ${block.delivery}` : `Delivery ${block.delivery}`}
          </p>
        </aside>
      </div>
    </main>
  );
}
