"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LOGO_PATHS } from "./LogoMark";

/*
 * Background drawing made from the SEU mark, as era.estate draws its own logo across its dark
 * sections: the wireframe "S" at architectural scale in hairlines, the long edges of its strips
 * drawn on far beyond the mark and fading out, and a slow cognac gleam travelling across them.
 * Purely decorative; the gleam pauses for reduced motion.
 */

type Pt = [number, number];

// The mark's group is shifted by this in LogoMark's SVG.
const ORIGIN: Pt = [-881.5, -19.807];

/** Corner points of one strip from its path data (M/L/l/v/Z, with implicit repeats). */
function corners(d: string, t: Pt): Pt[] {
  const tokens = d.match(/[MLlVvHhZz]|-?\d*\.?\d+/g) ?? [];
  const pts: Pt[] = [];
  let cmd = "M";
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length; ) {
    const tok = tokens[i];
    if (/[A-Za-z]/.test(tok)) {
      cmd = tok;
      i++;
      if (cmd === "Z" || cmd === "z") continue;
    }
    const n = () => parseFloat(tokens[i++]);
    if (cmd === "M" || cmd === "L") {
      x = n();
      y = n();
      if (cmd === "M") cmd = "L";
    } else if (cmd === "l") {
      x += n();
      y += n();
    } else if (cmd === "v") y += n();
    else if (cmd === "V") y = n();
    else if (cmd === "h") x += n();
    else if (cmd === "H") x = n();
    else break;
    pts.push([x + t[0] + ORIGIN[0], y + t[1] + ORIGIN[1]]);
  }
  return pts;
}

const STRIPS = LOGO_PATHS.map((p) => corners(p.d, p.t));

// The slanted (long) edges of every strip, extended far to both sides.
const REACH = 90;
const GUIDES = STRIPS.flatMap((pts) => {
  const out: [Pt, Pt][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    if (Math.abs(dx) < 1) continue; // the short vertical ends stay as they are
    const k = (b[1] - a[1]) / dx;
    out.push([
      [a[0] - REACH, a[1] - k * REACH],
      [a[0] + REACH, a[1] + k * REACH],
    ]);
  }
  return out;
});

const outline = (pts: Pt[]) => `M${pts.map((p) => p.join(",")).join("L")}Z`;
const STRIP_D = STRIPS.map(outline).join("");
const GUIDE_D = GUIDES.map(([a, b]) => `M${a.join(",")}L${b.join(",")}`).join("");

export default function LogoLines({
  className = "",
  // Where the mark sits: share of the width for its centre, and its height relative to the block.
  x = 0.75,
  y = 0.5,
  size = 0.78,
  tone = "dark",
}: {
  className?: string;
  x?: number;
  y?: number;
  size?: number;
  /** Cream hairlines on the dark forest, ink hairlines on paper. */
  tone?: "dark" | "light";
}) {
  const ink = tone === "dark" ? "246 241 232" : "19 33 29";
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [aspect, setAspect] = useState(16 / 9);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) svg.pauseAnimations();
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setAspect(width / height);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  // A view onto the mark with the block's own proportions; the mark is ~47 units tall.
  const vh = 47.4 / size;
  const vw = vh * aspect;
  const vx = 26.5 - vw * x;
  const vy = 23.7 - vh * y;

  return (
    <svg
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <radialGradient id={`${id}-fade`} cx="26.5" cy="23.7" r="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect x={vx - 200} y={vy - 200} width={vw + 400} height={vh + 400} fill={`url(#${id}-fade)`} />
        </mask>
        {/* A narrow band of cognac light sweeping diagonally across the drawing. */}
        <linearGradient id={`${id}-gleam`} x1="-60" y1="-20" x2="0" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e39a62" stopOpacity="0" />
          <stop offset="0.5" stopColor={tone === "dark" ? "#ffc89a" : "#b45a22"} stopOpacity={tone === "dark" ? 0.55 : 0.35} />
          <stop offset="1" stopColor="#e39a62" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-60 -30; 140 70"
            dur="14s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <g mask={`url(#${id}-mask)`} vectorEffect="non-scaling-stroke">
        <path d={GUIDE_D} stroke={`rgb(${ink} / 0.035)`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={GUIDE_D} stroke={`url(#${id}-gleam)`} strokeOpacity="0.25" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </g>
      <path d={STRIP_D} stroke={`rgb(${ink} / ${tone === "dark" ? 0.1 : 0.08})`} strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={STRIP_D} stroke={`url(#${id}-gleam)`} strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
