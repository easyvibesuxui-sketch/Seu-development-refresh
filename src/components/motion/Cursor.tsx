"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// The label follows the language of the element under the pointer (the page, or a block with its own lang).
const LABELS: Record<string, Record<string, string>> = {
  en: { drag: "Drag", play: "Play" },
  ka: { drag: "გადაწიე", play: "ჩართვა" },
};

/**
 * Soft ring cursor for fine pointers; grows with a label over [data-cursor] areas.
 * Over links, buttons and fields the ring steps aside (their own hover says enough), as does
 * data-cursor="native" where it would sit on top of a highlight (floor bands).
 */
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
      const mode = interactive && zone !== "play" && zone !== "native" ? "link" : zone ?? "";
      ring.dataset.mode = mode;
      const lang = target.closest<HTMLElement>("[lang]")?.lang === "en" ? "en" : "ka";
      if (labelRef.current) labelRef.current.textContent = LABELS[lang][mode] ?? "";
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
