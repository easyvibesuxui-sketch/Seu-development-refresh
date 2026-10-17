"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_PATHS } from "./LogoMark";

/*
 * Background drawing made from the SEU mark, as era.estate draws its own logo across its
 * sections: the wireframe "S" at architectural scale in the faintest hairlines. Where the
 * pointer moves over the section, the lines near it warm up a little (a soft spotlight that
 * fades when the pointer leaves). Purely decorative; still for reduced motion and touch.
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


const outline = (pts: Pt[]) => `M${pts.map((p) => p.join(",")).join("L")}Z`;
const STRIP_D = STRIPS.map(outline).join("");

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

  // A view onto the mark with the block's own proportions; the mark is ~47 units tall.
  const vh = 47.4 / size;
  const vw = vh * aspect;
  const vx = 26.5 - vw * x;
  const vy = 23.7 - vh * y;
  const view = `${vx} ${vy} ${vw} ${vh}`;

  return (
    <div ref={ref} aria-hidden className={`logo-lines pointer-events-none absolute inset-0 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox={view} preserveAspectRatio="xMidYMid slice" fill="none">
        <path d={STRIP_D} stroke={`rgb(${ink} / ${tone === "dark" ? 0.05 : 0.045})`} strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="logo-lines__glow absolute inset-0 h-full w-full" viewBox={view} preserveAspectRatio="xMidYMid slice" fill="none">
        <path d={STRIP_D} stroke={`rgb(${glow} / ${tone === "dark" ? 0.32 : 0.28})`} strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
