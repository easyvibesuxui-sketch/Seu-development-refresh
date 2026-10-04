"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import styles from "./Clouds.module.css";

export type CloudsHandle = { part: (duration: number) => gsap.core.Timeline | null };

/** Fractal value noise rendered once into a soft, tileable-looking cloud texture. */
function cloudTexture(size = 384, seed = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const grid = 64;
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const lattice = Array.from({ length: grid * grid }, rand);
  const at = (x: number, y: number) => lattice[((y % grid) + grid) % grid * grid + (((x % grid) + grid) % grid)];
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
      // Fade to the edges so each sheet reads as a cloud bank, not a square.
      const dx = x / size - 0.5;
      const dy = y / size - 0.5;
      const falloff = Math.max(0, 1 - Math.hypot(dx, dy) * 2.1);
      const alpha = Math.max(0, Math.min(1, (v - 0.38) * 2.6)) * falloff;
      const i = (y * size + x) * 4;
      img.data[i] = 226;
      img.data[i + 1] = 233;
      img.data[i + 2] = 229;
      img.data[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

const SHEETS = [
  { x: -18, y: -10, size: 95, dir: [-1, -0.6], seed: 3 },
  { x: 38, y: -18, size: 100, dir: [1, -0.7], seed: 7 },
  { x: -25, y: 34, size: 105, dir: [-1, 0.6], seed: 11 },
  { x: 40, y: 30, size: 100, dir: [1, 0.7], seed: 17 },
  { x: 8, y: 6, size: 90, dir: [0, 1], seed: 23 },
];

const Clouds = forwardRef<CloudsHandle>(function Clouds(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheets = rootRef.current?.querySelectorAll<HTMLElement>(`.${styles.sheet}`);
    sheets?.forEach((el, i) => {
      el.style.backgroundImage = `url(${cloudTexture(384, SHEETS[i].seed)})`;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    part(duration) {
      const root = rootRef.current;
      if (!root) return null;
      const tl = gsap.timeline({ onComplete: () => root.remove() });
      root.querySelectorAll<HTMLElement>(`.${styles.sheet}`).forEach((el, i) => {
        const [dx, dy] = SHEETS[i].dir;
        tl.to(
          el,
          { xPercent: dx * 70, yPercent: dy * 60, scale: 2.2, opacity: 0, duration, ease: "power2.inOut" },
          i * 0.06,
        );
      });
      tl.to(root.querySelector(`.${styles.veil}`), { opacity: 0, duration: duration * 0.7, ease: "power1.out" }, 0);
      return tl;
    },
  }));

  return (
    <div ref={rootRef} className={styles.root} aria-hidden>
      <div className={styles.veil} />
      {SHEETS.map((s, i) => (
        <div
          key={i}
          className={styles.sheet}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}vmax`, height: `${s.size}vmax` }}
        />
      ))}
    </div>
  );
});

export default Clouds;
