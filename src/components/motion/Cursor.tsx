"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const LABELS: Record<string, string> = { drag: "Drag", play: "Play" };

/** Soft ring cursor for fine pointers; grows with a label over [data-cursor] areas. */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const xTo = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target as HTMLElement;
      // Interactive elements take precedence over the area they sit in.
      const interactive = target.closest("a, button, input, label");
      const zone = target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      const mode = interactive && zone !== "play" ? "link" : zone ?? "";
      ring.dataset.mode = mode;
      if (labelRef.current) labelRef.current.textContent = LABELS[mode] ?? "";
    };
    const onLeave = () => (ring.dataset.hidden = "true");
    const onEnter = () => (ring.dataset.hidden = "false");
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div ref={ringRef} className="cursor" aria-hidden>
      <span ref={labelRef} />
    </div>
  );
}
