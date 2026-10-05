"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { blockById, statusText, unitsOn, varketiliBlocks, type Unit } from "@/data/inventory";
import ApartmentCard from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import { ArrowButton } from "./ProjectDetails";

// Floor plate: four flats on the north side facing Hualing, three on the south facing the Tbilisi Sea.
const SLOT_POS = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 0.5, y: 1 },
  { x: 1.5, y: 1 },
  { x: 2.5, y: 1 },
];

const statusFill: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

export default function FloorExplorer({ blockId }: { blockId: string }) {
  const block = blockById(blockId)!;
  const [floor, setFloor] = useState(Math.min(8, block.floors));
  const [view, setView] = useState<"plan" | "grid">("plan");
  const [hover, setHover] = useState<string | null>(null);
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

      <div className="mt-10 grid gap-10 lg:grid-cols-[160px_minmax(0,1fr)_220px]">
        <aside aria-label="Block and floor" className="flex flex-row items-center justify-between gap-6 lg:flex-col lg:items-start lg:justify-start">
          <div>
            <p className="eyebrow mb-4">SEU Varketili</p>
            <h1 className="section-title text-[clamp(40px,4vw,64px)]" data-split>
              {block.name}
            </h1>
          </div>
          <div className="flex items-center gap-4 lg:mt-24 lg:flex-col lg:items-start">
            <ArrowButton dir="up" onClick={() => step(1)} label="Floor up" />
            <div className="overflow-hidden">
              <span ref={numberRef} className="page-title block text-[clamp(56px,5vw,88px)] leading-none tabular-nums">
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
              <div className="relative mx-auto w-full max-w-[760px]">
                <p className="label mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">North · Hualing</p>
                <div className="relative grid grid-cols-4 grid-rows-2 gap-[2px]">
                  {floorUnits.map((u) => {
                    const pos = SLOT_POS[u.slot];
                    return (
                      <Link
                        key={u.id}
                        href={u.status === "sold" ? "#" : `/apartments/${u.id}/`}
                        aria-disabled={u.status === "sold"}
                        onClick={(e) => u.status === "sold" && e.preventDefault()}
                        onMouseEnter={() => setHover(u.id)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(u.id)}
                        onBlur={() => setHover(null)}
                        className="group relative aspect-square"
                        style={{ gridColumn: `${Math.floor(pos.x) + 1} / span 1`, gridRow: pos.y + 1, transform: pos.x % 1 ? "translateX(50%)" : undefined }}
                        aria-label={`Apartment ${u.number}, ${statusText[u.status]}, ${u.totalArea} m²`}
                      >
                        <img src={withBase("/images/apartment-plan-light.png")} alt="" className="h-full w-full object-contain opacity-80" />
                        <span
                          className="absolute inset-[6%] rounded-sm transition-opacity duration-300"
                          style={{ background: statusFill[u.status], opacity: hover === u.id ? 0.45 : 0.12 }}
                        />
                        <span
                          className={`label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-[13px] shadow-lg transition-[opacity,transform] duration-300 ${
                            hover === u.id ? "scale-100 opacity-100" : "scale-75 opacity-0"
                          }`}
                          style={{ background: statusFill[u.status] }}
                        >
                          {statusText[u.status]}
                        </span>
                        <span className="label absolute left-2 top-1 text-[11px] text-seu-cream/70">{u.number}</span>
                        {hover === u.id && (
                          <span className="label absolute bottom-2 left-1/2 w-max -translate-x-1/2 rounded bg-seu-ink/90 px-2 py-1 text-[11px]">
                            {u.totalArea} m² · {u.bedrooms === 0 ? "Studio" : `${u.bedrooms} bd`}
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

        <aside aria-label="Legend and blocks" className="lg:pt-48">
          <p className="title-display text-right text-[22px] tracking-[0.08em]">Blocks</p>
          <div className="relative mt-3 aspect-[5/4] border-l border-t border-white/40">
            {varketiliBlocks.map((b) => (
              <Link
                key={b.id}
                href={`/projects/varketili/${b.id}/`}
                className={`label absolute grid place-items-center border text-[11px] uppercase transition-colors ${
                  b.id === blockId ? "border-seu-cream bg-seu-cream text-seu-ink" : "border-white/50 hover:border-seu-accent-hi hover:text-seu-accent-hi"
                }`}
                style={{ left: `${b.plan.x}%`, top: `${b.plan.y}%`, width: `${b.plan.w}%`, height: `${b.plan.h}%` }}
              >
                {b.id.toUpperCase()}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-right text-[13px] text-seu-muted">
            {block.floors} floors · {block.status === "delivered" ? `Delivered ${block.delivery}` : `Delivery ${block.delivery}`}
          </p>
        </aside>
      </div>
    </main>
  );
}
