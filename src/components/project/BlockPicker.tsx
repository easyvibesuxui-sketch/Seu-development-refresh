"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { units, varketiliBlocks, type Block } from "@/data/inventory";
import FilterPanel from "@/components/hero/FilterPanel";
import BackLink from "@/components/ui/BackLink";

/*
 * Building outlines on the Varketili render, in percent of the image (measured on
 * public/images/varketili-panorama.jpg). `top`/`bottom` bound the storeys so hovering a block
 * can light up its floors band by band.
 */
const SHAPES: Record<string, { x: number; w: number; top: number; bottom: number }> = {
  v2: { x: 5.5, w: 12.5, top: 50, bottom: 94 },
  v3: { x: 26.5, w: 18, top: 67, bottom: 96 },
  v4: { x: 44.6, w: 9.4, top: 66.5, bottom: 96 },
  v6: { x: 60.4, w: 8.2, top: 72, bottom: 96 },
  v7: { x: 73.2, w: 21.8, top: 63.5, bottom: 96 },
};

const availableIn = (b: Block) => units.filter((u) => u.block === b.id && u.status === "available").length;

export default function BlockPicker() {
  const [hover, setHover] = useState<string | null>(null);
  const [sun, setSun] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // On narrow screens the render is wider than the viewport: start centred, let people swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  return (
    <section data-tone="dark" className="tone-dark relative h-[100svh] min-h-[680px] overflow-hidden">
      <div ref={scrollerRef} className="absolute inset-0 overflow-x-auto overflow-y-hidden lg:overflow-hidden" data-cursor="drag">
        {/* The render keeps its aspect; the shapes share its coordinate box. */}
        <div className="absolute bottom-0 left-0 aspect-[1460/580] w-[230vw] lg:left-1/2 lg:w-[max(100%,calc(72svh*1460/580))] lg:-translate-x-1/2">
          <img src={withBase("/images/varketili-panorama.jpg")} alt="SEU Varketili render" className="h-full w-full" />
          {sun && <SunPath />}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {varketiliBlocks.map((b) => {
              const s = SHAPES[b.id];
              const active = hover === b.id;
              const floorH = (s.bottom - s.top) / b.floors;
              return (
                <g key={b.id} style={{ opacity: active ? 1 : 0, transition: "opacity .4s" }}>
                  {Array.from({ length: b.floors }, (_, f) => (
                    <rect
                      key={f}
                      x={s.x}
                      y={s.bottom - (f + 1) * floorH}
                      width={s.w}
                      height={floorH * 0.82}
                      fill="#c99268"
                      fillOpacity={0.55}
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "left",
                        transform: active ? "scaleX(1)" : "scaleX(0)",
                        transition: `transform .5s cubic-bezier(.2,.8,.2,1) ${f * 0.035}s`,
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          {varketiliBlocks.map((b, i) => {
            const s = SHAPES[b.id];
            return (
              <Link
                key={b.id}
                href={`/projects/varketili/${b.id}/`}
                aria-label={`${b.name}, ${b.floors} floors`}
                onMouseEnter={() => setHover(b.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(b.id)}
                onBlur={() => setHover(null)}
                className="group absolute"
                style={{ left: `${s.x}%`, top: `${s.top}%`, width: `${s.w}%`, height: `${s.bottom - s.top}%` }}
              >
                <span
                  className="block-pin absolute left-1/2 -translate-x-1/2"
                  style={{ bottom: "calc(100% + 10px)", animationDelay: `${0.6 + i * 0.12}s` }}
                >
                  <span className="label grid h-9 w-9 place-items-center rounded-full rounded-br-none bg-seu-surface text-[13px] ring-1 ring-white/50 [transform:rotate(45deg)] transition-colors group-hover:bg-seu-accent">
                    <span className="[transform:rotate(-45deg)]">{b.id.slice(1)}</span>
                  </span>
                </span>
                {hover === b.id && (
                  <span className="label absolute bottom-[calc(100%+58px)] left-1/2 w-max -translate-x-1/2 rounded-md bg-seu-ink/90 px-3 py-2 text-[12px] tracking-[0.06em] ring-1 ring-white/20">
                    {b.name} · {b.floors} floors · {availableIn(b)} available
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-seu-ink/85 via-transparent via-40% to-seu-bg" />

      <div className="relative z-10 mx-auto max-w-[1680px] px-gutter pt-36">
        <BackLink href="/projects/" label="All projects" />
        <p className="eyebrow mt-12">Visual search · Choose a block</p>
        <h1 className="page-title mt-6" data-split>
          SEU Varketili<span className="text-seu-accent-hi">.</span>
        </h1>
        <button type="button" aria-pressed={sun} onClick={() => setSun(!sun)} className="btn btn-glass mt-8 aria-pressed:bg-seu-accent">
          <SunIcon /> {sun ? "Hide sun path" : "Show sun path"}
        </button>
      </div>

      <FilterPanel tone="dark" className="absolute right-gutter top-36 z-10 hidden lg:block" />
    </section>
  );
}

/** Morning-to-evening sun arc over the render, east (left) to west (right). */
function SunPath() {
  return (
    <svg className="sun-path absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sun-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#ffd59a" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#ffd59a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9a5c" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path d="M2 38 Q50 -6 98 38" fill="none" stroke="url(#sun-arc)" strokeWidth="0.25" strokeDasharray="0.8 0.8" vectorEffect="non-scaling-stroke" />
      <circle r="1.4" fill="#ffd59a">
        <animateMotion dur="8s" repeatCount="indefinite" path="M2 38 Q50 -6 98 38" />
      </circle>
      <text x="2" y="36" fontSize="1.6" fill="#f3efe9" fontFamily="sans-serif">E · morning</text>
      <text x="46" y="10" fontSize="1.6" fill="#f3efe9" fontFamily="sans-serif">S · noon</text>
      <text x="88" y="36" fontSize="1.6" fill="#f3efe9" fontFamily="sans-serif">W · evening</text>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 13h18M5 13a5 5 0 0 1 10 0M10 2v2M3.5 5l1.4 1.4M16.5 5l-1.4 1.4M1 9h2M17 9h2" />
    </svg>
  );
}
