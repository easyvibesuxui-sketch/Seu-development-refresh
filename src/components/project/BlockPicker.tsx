"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withBase } from "@/data/projects";
import { bedroomText, unitsOn, varketiliBlocks, type Block } from "@/data/inventory";
import FilterPanel from "@/components/hero/FilterPanel";

// The 3D sun study loads its map only when opened.
const SunStudy = dynamic(() => import("./SunStudy"), { ssr: false });

// Golden-hour render of SEU Varketili (Kling / Gemini 3 Pro from the developer's panorama).
const RENDER = "/images/varketili-rise.jpg";
const RATIO = 5504 / 3072;

/*
 * Facades measured on the render, in percent of the image. Each part is one facade plane:
 * its left and right edges, the roof line and the storey height at the left edge. A facade
 * turned away from us (Block 2) shrinks toward the horizon `h` by `s` at its right edge, so
 * its storey lines slope like the render's. Storeys count down from the roof: the top band
 * is the block's highest floor.
 */
type Part = { xl: number; xr: number; top: number; pitch: number; h?: number; s?: number };
const FACADES: Record<string, Part[]> = {
  v2: [{ xl: 2.4, xr: 12.4, top: 34.8, pitch: 3.6, h: 70.3, s: 0.831 }],
  v3: [{ xl: 18.6, xr: 30.9, top: 47.6, pitch: 3.95 }],
  v4: [{ xl: 34.6, xr: 45.4, top: 44.3, pitch: 4.05 }],
  v6: [{ xl: 48.4, xr: 59.5, top: 51, pitch: 4.15 }],
  v7: [
    { xl: 63.9, xr: 82.4, top: 43.4, pitch: 4.4 },
    { xl: 85, xr: 99.2, top: 36.6, pitch: 4.4 },
  ],
};

/**
 * Where each block's pin stands: the highest point of its roof (parapet or stair core), in
 * percent of the image. Block 2's sits toward its far edge, clear of the page title.
 */
const PINS: Record<string, { x: number; y: number }> = {
  v2: { x: 9, y: 37.7 },
  v3: { x: 24.7, y: 47.3 },
  v4: { x: 40, y: 43.9 },
  v6: { x: 54, y: 50.2 },
  v7: { x: 73, y: 43.1 },
};

/** y of a storey line (given at the left edge) at x, following the facade's perspective. */
function lineAt(p: Part, yLeft: number, x: number) {
  if (!p.h || !p.s) return yLeft;
  const s = 1 + (p.s - 1) * ((x - p.xl) / (p.xr - p.xl));
  return p.h + (yLeft - p.h) * s;
}

/** Outline of one floor across one facade part, as SVG polygon points. */
function band(p: Part, floors: number, floor: number) {
  const y0 = p.top + (floors - floor) * p.pitch;
  const y1 = y0 + p.pitch;
  return [
    [p.xl, lineAt(p, y0, p.xl)],
    [p.xr, lineAt(p, y0, p.xr)],
    [p.xr, lineAt(p, y1, p.xr)],
    [p.xl, lineAt(p, y1, p.xl)],
  ];
}

const floorHref = (b: Block, floor: number) => `/projects/varketili/${b.id}/?floor=${Math.max(2, floor)}`;

type Hover = { block: Block; floor: number };

export default function BlockPicker() {
  const [hover, setHover] = useState<Hover | null>(null);
  const [sun, setSun] = useState(false);
  const sunButton = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // On narrow screens the render is wider than the viewport: start centred, let people swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <section data-tone="dark" className="tone-dark relative h-[100svh] min-h-[680px] overflow-hidden bg-seu-ink">
      <div ref={scrollerRef} className="absolute inset-0 overflow-x-auto overflow-y-hidden lg:overflow-hidden">
        {/* The render covers the stage at its own aspect; floors and pins share its coordinate box. */}
        <div
          className="absolute bottom-0 left-0 lg:left-1/2 lg:-translate-x-1/2"
          style={{ aspectRatio: `${RATIO}`, width: `max(100%, calc(max(100svh, 680px) * ${RATIO}))` }}
          onMouseLeave={() => setHover(null)}
        >
          <img src={withBase(RENDER)} alt="SEU Varketili at golden hour: five residential blocks" className="h-full w-full" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" data-cursor="native">
            {varketiliBlocks.map((b) =>
              Array.from({ length: b.floors }, (_, i) => {
                const floor = i + 1;
                const on = hover?.block.id === b.id && hover.floor === floor;
                const inBlock = hover?.block.id === b.id;
                return (
                  <a
                    key={`${b.id}-${floor}`}
                    href={withBase(floorHref(b, floor))}
                    tabIndex={-1}
                    aria-hidden
                    onMouseEnter={() => setHover({ block: b, floor })}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(floorHref(b, floor));
                    }}
                    // Mouse-only shortcut (keyboard goes through the pins): no focus ring on click.
                    className="cursor-pointer outline-none"
                  >
                    {FACADES[b.id].map((p, k) => (
                      <polygon
                        key={k}
                        points={band(p, b.floors, floor).map((pt) => pt.join(",")).join(" ")}
                        fill={on ? "#e07a3a" : "#fff"}
                        fillOpacity={on ? 0.5 : inBlock ? 0.06 : 0}
                        style={{ transition: "fill-opacity .25s, fill .25s" }}
                      />
                    ))}
                  </a>
                );
              }),
            )}
          </svg>

          {varketiliBlocks.map((b, i) => {
            const pin = PINS[b.id];
            // A badge on a hairline stem, its foot dot resting on the roof.
            return (
              <Link
                key={b.id}
                href={`/projects/varketili/${b.id}/`}
                aria-label={`${b.name}, ${b.floors} floors: choose a floor`}
                className="group absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span className="block-pin flex flex-col items-center" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                  <span className="label grid h-10 w-10 place-items-center rounded-full bg-seu-ink/85 text-[14px] text-white ring-1 ring-white/60 backdrop-blur transition-colors group-hover:bg-seu-accent group-focus-visible:bg-seu-accent">
                    {b.id.slice(1)}
                  </span>
                  <span className="h-7 w-px bg-white/80" />
                  <span className="-mb-[3px] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255/0.25)]" />
                </span>
              </Link>
            );
          })}

          {hover && <FloorCard {...hover} />}
        </div>
      </div>
      {/* Shade under the title and a short fade into the page below; the render stays bright between. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-seu-ink/75 via-seu-ink/30 to-transparent" />
      {/* A softer shade in the corner under the heading and its links. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-[radial-gradient(60%_80%_at_0%_10%,rgb(12_22_19/0.7),transparent_72%)] max-md:bg-[radial-gradient(130%_75%_at_0%_10%,rgb(12_22_19/0.85),transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-seu-bg to-transparent" />

      {/* Compact heading, as on era.estate: the buildings carry the screen. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-[1680px] px-gutter pt-28 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {/* Navigation reads as a quiet text link; the sun study is the one call to action. */}
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/projects/" className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-seu-ink/55 backdrop-blur transition-colors group-hover:border-white group-hover:bg-seu-ink/80">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="[text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">All projects</span>
          </Link>
          <button ref={sunButton} type="button" aria-haspopup="dialog" onClick={() => setSun(true)} className="btn btn-primary btn-sm">
            <SunIcon /> Sun study
          </button>
        </div>
        <p className="eyebrow mt-8 text-white/85">Visual search · Choose a floor</p>
        <h1 className="title-display mt-3 text-[clamp(32px,3.4vw,56px)] uppercase leading-none" data-split>
          SEU Varketili<span className="text-seu-accent-hi">.</span>
        </h1>
      </div>

      <FilterPanel tone="dark" className="absolute bottom-10 right-gutter z-10 hidden lg:block" />
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
 * Floor card, as on era.estate: the floor and block in large figures, delivery, then what is
 * still available on that floor by flat type. Sits beside the facade,
 * on whichever side has room.
 */
function FloorCard({ block, floor }: Hover) {
  const parts = FACADES[block.id];
  const p = parts[parts.length - 1];
  const left = parts[0].xl;
  const right = p.xr;
  const y = lineAt(p, p.top + (block.floors - floor + 0.5) * p.pitch, right);
  const flip = right > 66;
  const all = unitsOn(block.id, floor);
  const total = all.length;
  const free = all.filter((u) => u.status === "available");
  const types = [...new Set(free.map((u) => u.bedrooms))].sort((a, b) => a - b);

  return (
    <div
      aria-hidden
      className="tone-light pointer-events-none absolute z-20 w-[300px] rounded-[20px] p-6 shadow-[0_30px_70px_rgb(0_0_0/0.35)]"
      style={{
        top: `clamp(12%, ${y}%, 70%)`,
        ...(flip ? { right: `${100 - left + 1.2}%` } : { left: `${right + 1.2}%` }),
        transform: "translateY(-50%)",
      }}
    >
      <div className="grid grid-cols-2 divide-x divide-seu-line">
        <p>
          <span className="title-display block text-[48px] leading-none">{String(floor).padStart(2, "0")}</span>
          <span className="label mt-2 block text-[12px] uppercase tracking-[0.16em]">Floor</span>
        </p>
        <p className="pl-6">
          <span className="title-display block text-[48px] leading-none">{block.id.slice(1)}</span>
          <span className="label mt-2 block text-[12px] uppercase tracking-[0.16em]">Block</span>
        </p>
      </div>
      <p className="mt-5 border-t border-seu-line pt-4 text-[12px] uppercase tracking-[0.14em] text-seu-muted">
        {block.status === "delivered" ? `Delivered ${block.delivery}` : `Completion ${block.delivery}`}
      </p>
      {floor === 1 ? (
        <p className="mt-3 text-[14px]">Lobby and retail</p>
      ) : types.length ? (
        <>
          <p className="mt-3 text-[14px]">
            <span className="font-semibold">{free.length}</span> of {total} flats available
          </p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {types.map((t) => {
              const of = free.filter((u) => u.bedrooms === t);
              return (
                <li key={t} className="grid grid-cols-[1fr_auto] items-baseline gap-3">
                  <span className="font-semibold">{bedroomText(t)}</span>
                  <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-white" style={{ background: "var(--seu-available)" }}>
                    {of.length} free
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-[14px] text-seu-muted">No flats available on this floor</p>
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
