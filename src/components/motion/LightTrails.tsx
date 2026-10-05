"use client";

import { useEffect, useRef } from "react";

/*
 * Ribbons of light circling on tilted orbits, after the light trails on era.estate (which draws
 * them as WebGL tubes with bloom). Here a 2D canvas draws each trail as a tapering arc of an
 * ellipse in additive blending, in three passes (wide haze, glow, hot core), so it stays light
 * and works everywhere. The far half of each orbit is dimmer, so rings pass behind a subject.
 *
 * Presets:
 *   swirl  a dense whirl of many strands (a vortex of light around a picture)
 *   orbit  a few fine, flat rings with dust sparkling along their heads (across a title)
 *
 * Motion runs only while the canvas is on screen; scrolling turns the orbits a little further
 * and the trails draw themselves in as the block enters. Reduced motion gets one still frame.
 */

type Strand = {
  r: number; // radius, share of the canvas' smaller side
  tilt: number; // how flat the orbit is (0 = facing us, PI/2 = edge-on)
  roll: number; // rotation of the ellipse on screen
  phase: number; // head angle at t = 0
  len: number; // arc length in radians
  speed: number; // radians per second
  width: number; // core width in px
  alpha: number;
  warm: number; // 0 = deep cognac, 1 = pale gold
};

type Preset = {
  strands: (rand: () => number) => Strand[];
  cx: number;
  cy: number;
  sparkle: number; // dust particles spawned per strand per second
  trace: number; // opacity of the full, faint orbit line
};

const PRESETS: Record<"swirl" | "orbit", Preset> = {
  swirl: {
    cx: 0.5,
    cy: 0.5,
    sparkle: 0,
    trace: 0,
    strands: (rand) =>
      Array.from({ length: 46 }, (_, i) => ({
        r: 0.34 + rand() * 0.18,
        tilt: 1.02 + rand() * 0.16,
        roll: -0.42 + rand() * 0.1,
        phase: rand() * Math.PI * 2,
        len: 1.4 + rand() * 1.8,
        speed: 0.32 + rand() * 0.16,
        width: i % 5 === 0 ? 3.4 + rand() * 2.2 : 0.9 + rand() * 1.6,
        alpha: 0.5 + rand() * 0.5,
        warm: rand(),
      })),
  },
  orbit: {
    cx: 0.5,
    cy: 0.5,
    sparkle: 26,
    trace: 0.07,
    strands: (rand) =>
      Array.from({ length: 5 }, (_, i) => ({
        r: 0.62 + i * 0.07 + rand() * 0.03,
        tilt: 1.3 + rand() * 0.06,
        roll: -0.1 + rand() * 0.05,
        phase: rand() * Math.PI * 2,
        len: 1.8 + rand() * 1.6,
        speed: 0.16 + rand() * 0.1,
        width: i === 1 ? 2.2 : 0.8 + rand() * 0.8,
        alpha: 0.7 + rand() * 0.3,
        warm: 0.4 + rand() * 0.6,
      })),
  },
};

// Seeded so the composition is the same on every visit.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Tail → head: deep cognac, warm orange, pale gold, near-white at the very tip.
function trailColor(t: number, warm: number) {
  const r = 255;
  const g = Math.round(96 + 120 * t * (0.6 + 0.4 * warm) + 30 * warm);
  const b = Math.round(30 + 150 * Math.pow(t, 3) * (0.5 + 0.5 * warm));
  return `${r},${Math.min(g, 245)},${Math.min(b, 225)}`;
}

type Dust = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number };

export default function LightTrails({
  preset = "swirl",
  className = "",
  seed = 7,
  cx,
  cy,
  scale = 1,
}: {
  preset?: "swirl" | "orbit";
  className?: string;
  seed?: number;
  /** Centre of the orbits as a share of the canvas (defaults per preset). */
  cx?: number;
  cy?: number;
  /** Multiplies every orbit radius. */
  scale?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = PRESETS[preset];
    const strands = p.strands(seeded(seed));
    const centre = { x: cx ?? p.cx, y: cy ?? p.cy };
    const dust: Dust[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let frame = 0;
    let visible = false;
    let last = performance.now();
    let clock = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    // Screen position of angle `a` on a strand's orbit, plus depth (-1 far … 1 near).
    const project = (s: Strand, a: number, base: number) => {
      const R = s.r * base * scale;
      const x = R * Math.cos(a);
      const y = R * Math.sin(a) * Math.cos(s.tilt);
      const z = Math.sin(a);
      const persp = 1 + z * 0.12 * Math.sin(s.tilt);
      const cr = Math.cos(s.roll);
      const sr = Math.sin(s.roll);
      return {
        x: centre.x * w + (x * cr - y * sr) * persp,
        y: centre.y * h + (x * sr + y * cr) * persp,
        z,
        persp,
      };
    };

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      const base = Math.min(w, h);
      const rect = canvas.getBoundingClientRect();
      const vh = window.innerHeight;
      // Draw in as the block enters; turn a little further as the page scrolls.
      const reveal = reduce ? 1 : Math.min(1, Math.max(0.05, (vh - rect.top) / (vh * 0.9)));
      const spin = reduce ? 0 : (-rect.top / vh) * 0.9;

      if (p.trace) {
        for (const s of strands) {
          ctx.beginPath();
          for (let i = 0; i <= 96; i++) {
            const q = project(s, (i / 96) * Math.PI * 2, base);
            if (i) ctx.lineTo(q.x, q.y);
            else ctx.moveTo(q.x, q.y);
          }
          ctx.strokeStyle = `rgba(255,190,140,${p.trace})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      const CHUNKS = 14;
      const STEPS = 4;
      for (const s of strands) {
        const head = s.phase + clock * s.speed + spin;
        const len = s.len * reveal;
        // Three passes: haze, glow, core.
        for (const [wMul, aMul] of [
          [8, 0.06],
          [3, 0.24],
          [1, 1],
        ] as const) {
          for (let c = 0; c < CHUNKS; c++) {
            const t0 = c / CHUNKS;
            const t1 = (c + 1) / CHUNKS;
            const tm = (t0 + t1) / 2;
            const mid = project(s, head - len * (1 - tm), base);
            const depth = mid.z < 0 ? 0.4 + 0.6 * (1 + mid.z) : 1;
            const a = s.alpha * Math.pow(tm, 1.5) * depth * aMul;
            if (a < 0.004) continue;
            ctx.beginPath();
            for (let k = 0; k <= STEPS; k++) {
              const q = project(s, head - len * (1 - (t0 + ((t1 - t0) * k) / STEPS)), base);
              if (k) ctx.lineTo(q.x, q.y);
              else ctx.moveTo(q.x, q.y);
            }
            ctx.strokeStyle = `rgba(${trailColor(tm, s.warm)},${Math.min(a, 1)})`;
            ctx.lineWidth = s.width * (0.25 + 0.75 * Math.pow(tm, 0.6)) * mid.persp * wMul;
            ctx.stroke();
          }
        }

        // Dust shed from the head.
        if (p.sparkle && !reduce && Math.random() < p.sparkle * dt) {
          const q = project(s, head - Math.random() * 0.25 * len, base);
          dust.push({
            x: q.x + (Math.random() - 0.5) * 10,
            y: q.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 6 - 2,
            life: 0.8 + Math.random() * 1.4,
            age: 0,
            size: 0.6 + Math.random() * 1.3,
          });
        }
      }

      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.age += dt;
        if (d.age > d.life) {
          dust.splice(i, 1);
          continue;
        }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const k = d.age / d.life;
        const a = Math.sin(Math.PI * k) * 0.9;
        ctx.fillStyle = `rgba(255,236,200,${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      draw(dt);
      if (visible) frame = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce || !visible) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reduce) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      } else if (visible) {
        draw(0);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, [preset, seed, cx, cy, scale]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
