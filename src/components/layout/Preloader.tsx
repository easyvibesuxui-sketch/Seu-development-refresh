"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import LogoMark from "@/components/brand/LogoMark";
import { MAP_READY_EVENT, mapIsReady, startIntro } from "@/lib/intro";

const MIN_MS = 1800;
const MAX_WAIT_MS = 9000;

/**
 * Shown on every full page load (first visit and refresh). Counts to 100 while the hero map
 * loads, then lifts away and hands over to the cloud fly-in.
 */
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // The WebGL map can stall frames while tiles load; keep timelines on wall-clock time
    // instead of letting GSAP's lag smoothing slow the intro down.
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("is-loading");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const progress = { value: 0 };
    const render = () => {
      if (countRef.current) countRef.current.textContent = String(Math.round(progress.value));
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pl-line",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: reduce ? 0 : 2.4, ease: "power2.inOut", stagger: 0.05 },
      );
      gsap.from(".pl-logo", { opacity: 0, y: 12, duration: 1.2, ease: "power2.out", delay: 0.2 });
    }, root);

    // Ease towards 90% on a timer; the last stretch waits for the map's first render.
    const head = gsap.to(progress, { value: 90, duration: MIN_MS / 1000, ease: "power1.inOut", onUpdate: render });
    const started = performance.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      gsap.delayedCall(wait / 1000, () => {
        head.kill();
        gsap
          .timeline()
          .to(progress, { value: 100, duration: 0.5, ease: "power2.out", onUpdate: render })
          .add(() => startIntro())
          .to(root, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0.2 : 1.1, ease: "expo.inOut" }, "+=0.05")
          .add(() => {
            document.documentElement.classList.remove("is-loading");
            root.remove();
          });
      });
    };

    if (mapIsReady()) finish();
    window.addEventListener(MAP_READY_EVENT, finish);
    const fallback = window.setTimeout(finish, MAX_WAIT_MS);

    return () => {
      ctx.revert();
      head.kill();
      window.removeEventListener(MAP_READY_EVENT, finish);
      window.clearTimeout(fallback);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader" role="status" aria-label="Loading">
      <Ornament />
      <div className="pl-logo">
        <LogoMark className="w-16" />
      </div>
      <p className="pl-count" aria-hidden>
        <span ref={countRef}>0</span>
        <sup>%</sup>
      </p>
    </div>
  );
}

/** Thin symmetric arcs growing from a central stem, drawn in on load. */
function Ornament() {
  const arcs = [0, 1, 2, 3, 4];
  return (
    <svg className="pl-ornament" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pl-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b5a3c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#c99268" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8b5a3c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="url(#pl-stroke)" strokeWidth="1">
        <path className="pl-line" pathLength={1} strokeDasharray="1" d="M400 -20V1020" />
        {arcs.map((i) => {
          const y = 120 + i * 210;
          return (
            <g key={i}>
              <path className="pl-line" pathLength={1} strokeDasharray="1" d={`M400 ${y + 140}C390 ${y + 40} 300 ${y - 20} 120 ${y - 160}`} />
              <path className="pl-line" pathLength={1} strokeDasharray="1" d={`M400 ${y + 140}C410 ${y + 40} 500 ${y - 20} 680 ${y - 160}`} />
              <path
                className="pl-line"
                pathLength={1}
                strokeDasharray="1"
                strokeOpacity=".45"
                d={`M400 ${y + 140}C380 ${y + 70} 200 ${y + 20} -20 ${y - 60}`}
              />
              <path
                className="pl-line"
                pathLength={1}
                strokeDasharray="1"
                strokeOpacity=".45"
                d={`M400 ${y + 140}C420 ${y + 70} 600 ${y + 20} 820 ${y - 60}`}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
