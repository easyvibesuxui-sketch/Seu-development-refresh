"use client";

import { useEffect, useId, useRef } from "react";

/**
 * A thin warm streak of light that draws itself across a heading when it scrolls into view,
 * the way era.estate runs a glowing ring through its titles. Decorative only.
 */
export default function LightStreak({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const gradient = `streak-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-lit");
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} aria-hidden className={`light-streak ${className}`} viewBox="0 0 100 40" preserveAspectRatio="none" fill="none">
      <defs>
        <linearGradient id={gradient} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffd9b8" stopOpacity="0" />
          <stop offset="0.35" stopColor="#ffd9b8" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#fff7ee" />
          <stop offset="0.78" stopColor="#e2905a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e2905a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="light-streak__glow" d="M1 30 C 24 4, 72 2, 99 22" stroke={`url(#${gradient})`} />
      <path className="light-streak__line" d="M1 30 C 24 4, 72 2, 99 22" stroke={`url(#${gradient})`} />
    </svg>
  );
}
