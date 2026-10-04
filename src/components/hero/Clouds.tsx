"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import styles from "./Clouds.module.css";

export type CloudsHandle = { descend: (duration: number) => gsap.core.Timeline | null };

/** Fractal value noise rendered once into a soft cloud puff with faded edges. */
function cloudTexture(size: number, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const grid = 64;
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const lattice = Array.from({ length: grid * grid }, rand);
  const at = (x: number, y: number) => lattice[(((y % grid) + grid) % grid) * grid + (((x % grid) + grid) % grid)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * tx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * tx;
    return a + (b - a) * ty;
  };
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.55;
      let freq = 4 / size;
      for (let o = 0; o < 5; o++) {
        v += noise(x * freq, y * freq) * amp;
        amp *= 0.5;
        freq *= 2;
      }
      const d = Math.hypot(x / size - 0.5, y / size - 0.5) * 2;
      const falloff = Math.max(0, 1 - d * d);
      const alpha = Math.max(0, Math.min(1, (v - 0.32) * 2.4)) * falloff;
      const i = (y * size + x) * 4;
      img.data[i] = 232;
      img.data[i + 1] = 236;
      img.data[i + 2] = 231;
      img.data[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

/*
 * Two depths of cloud:
 *  - "ring" banks circle the view, leaving a hole through which the city is seen from above;
 *  - "near" wisps sit right in front of the camera and rush past as it descends.
 * Positions are in vmax from the viewport centre.
 */
type Sheet = { kind: "ring" | "near"; x: number; y: number; size: number; seed: number; opacity: number };

const SHEETS: Sheet[] = [
  ...Array.from({ length: 9 }, (_, i): Sheet => {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    return { kind: "ring", x: Math.cos(a) * 50, y: Math.sin(a) * 36, size: 52 + (i % 3) * 8, seed: 3 + i * 7, opacity: 0.95 };
  }),
  { kind: "near", x: -16, y: 8, size: 30, seed: 71, opacity: 0.4 },
  { kind: "near", x: 18, y: -10, size: 26, seed: 83, opacity: 0.35 },
  { kind: "near", x: 6, y: 16, size: 24, seed: 97, opacity: 0.3 },
];

const Clouds = forwardRef<CloudsHandle>(function Clouds(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.querySelectorAll<HTMLElement>(`.${styles.sheet}`).forEach((el, i) => {
      el.style.backgroundImage = `url(${cloudTexture(320, SHEETS[i].seed)})`;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    descend(duration) {
      const root = rootRef.current;
      if (!root) return null;
      const tl = gsap.timeline({ onComplete: () => { root.style.display = "none"; } });
      const vmax = Math.max(window.innerWidth, window.innerHeight) / 100;
      root.querySelectorAll<HTMLElement>(`.${styles.sheet}`).forEach((el, i) => {
        const sheet = SHEETS[i];
        if (sheet.kind === "near") {
          // Wisps in front of the lens: accelerate towards the camera and burst past it.
          tl.to(el, { scale: 7, opacity: 0, duration: duration * 0.7, ease: "power2.in" }, (i % 3) * 0.08);
        } else {
          // Banks spread outwards as the hole grows, then thin out once below them.
          const k = 2.4;
          tl.to(
            el,
            { x: sheet.x * k * vmax, y: sheet.y * k * vmax, scale: 3.2, duration, ease: "power2.inOut" },
            (i % 3) * 0.05,
          ).to(el, { opacity: 0, duration: duration * 0.45, ease: "power1.in" }, duration * 0.5);
        }
      });
      tl.to(root.querySelector(`.${styles.vignette}`), { opacity: 0, duration: duration * 0.8 }, 0);
      return tl;
    },
  }));

  return (
    <div ref={rootRef} className={styles.root} aria-hidden>
      {SHEETS.map((s, i) => (
        <div
          key={i}
          className={styles.sheet}
          data-kind={s.kind}
          style={{
            width: `${s.size}vmax`,
            height: `${s.size}vmax`,
            marginLeft: `${-s.size / 2}vmax`,
            marginTop: `${-s.size / 2}vmax`,
            transform: `translate(${s.x}vmax, ${s.y}vmax)`,
            opacity: s.opacity,
          }}
        />
      ))}
      <div className={styles.vignette} />
    </div>
  );
});

export default Clouds;
