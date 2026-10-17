"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Background drawing from SEU's own brand frames (the blue Varketili stories): a pair of
 * upright hairlines with a level line across, and two great arcs that bow in toward the
 * uprights like a lens, plus a quarter arc rising from the foot. Drawn in the faintest
 * hairlines; where the pointer moves over the section the lines near it warm up a little
 * (a soft spotlight that fades when the pointer leaves). Purely decorative; still for
 * reduced motion and touch.
 */

/** The figure in units where the block is 100 tall and `w` wide, centred on `cx`. */
function figure(w: number, cx: number) {
  const m = 30; // gap between the uprights
  const xl = cx - m / 2;
  const xr = cx + m / 2;
  const r = 62; // the lens arcs
  const cy = 32; // height where each arc touches its upright
  const a = (deg: number) => (deg * Math.PI) / 180;
  const arc = (ox: number, from: number, to: number, sweep: 0 | 1) => {
    const p = (d: number) => `${(ox + r * Math.cos(a(d))).toFixed(2)},${(cy + r * Math.sin(a(d))).toFixed(2)}`;
    return `M${p(from)}A${r},${r} 0 0 ${sweep} ${p(to)}`;
  };
  const q = 34; // quarter arc at the foot, from the right upright out to the edge
  return [
    `M${xl},0V100`,
    `M${xr},0V100`,
    `M0,76H${w}`,
    arc(xl - r, -80, 80, 1),
    arc(xr + r, 260, 100, 0),
    `M${xr},100A${q},${q} 0 0 1 ${xr + q},${100 - q}`,
  ].join("");
}

export default function LogoLines({
  className = "",
  // Where the figure sits: share of the width for its centre.
  x = 0.75,
  tone = "dark",
}: {
  className?: string;
  x?: number;
  /** Kept for callers that size the old mark; the figure always spans the block's height. */
  size?: number;
  /** Cream hairlines on the dark forest, ink hairlines on paper. */
  tone?: "dark" | "light";
}) {
  const ink = tone === "dark" ? "246 241 232" : "19 33 29";
  const glow = tone === "dark" ? "255 214 180" : "168 84 31";
  const ref = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(16 / 9);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setAspect(width / height);
    });
    ro.observe(box);
    // Spotlight follows a fine pointer over the section; touch and reduced motion get none.
    const section = box.closest("section");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!section || !fine || still) return () => ro.disconnect();
    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      box.style.setProperty("--mx", `${e.clientX - r.left}px`);
      box.style.setProperty("--my", `${e.clientY - r.top}px`);
      box.classList.add("is-lit");
    };
    const leave = () => box.classList.remove("is-lit");
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    return () => {
      ro.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
    };
  }, []);

  // One unit is a hundredth of the block's height, so arcs stay round at any proportion.
  const w = 100 * aspect;
  // On narrow blocks the figure moves to the middle so both uprights stay in view.
  const d = figure(w, aspect < 1 ? w / 2 : w * x);
  const view = `0 0 ${w} 100`;

  return (
    <div ref={ref} aria-hidden className={`logo-lines pointer-events-none absolute inset-0 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox={view} preserveAspectRatio="none" fill="none">
        <path d={d} stroke={`rgb(${ink} / ${tone === "dark" ? 0.07 : 0.06})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="logo-lines__glow absolute inset-0 h-full w-full" viewBox={view} preserveAspectRatio="none" fill="none">
        <path d={d} stroke={`rgb(${glow} / ${tone === "dark" ? 0.38 : 0.32})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
