"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { useLang } from "@/lib/useLang";

/** The SEU card follows the pointer in 3D, floats gently and casts a moving glow. */
export default function TiltCard() {
  const ka = useLang() === "ka";
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const float = gsap.to(card, { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 22);
      ry(px * 26);
      card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    window.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      float.kill();
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative grid place-items-center py-10 [perspective:1100px]">
      <div className="absolute h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,#4fe0c8aa,#7bdc3a55,transparent)] blur-3xl" />
      <div ref={cardRef} className="tilt-card relative w-[min(340px,70vw)] [transform-style:preserve-3d]">
        <img src={withBase("/images/seu-card.png")} alt={ka ? "SEU ბარათი" : "SEU card"} className="w-full drop-shadow-[0_40px_40px_#15201d55]" />
        {/* Glare clipped to the card's own shape. */}
        <span
          className="pointer-events-none absolute inset-0 mix-blend-overlay [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,30%),#ffffff80,transparent_45%)]"
          style={{ maskImage: `url(${withBase("/images/seu-card.png")})`, maskSize: "100% 100%", WebkitMaskImage: `url(${withBase("/images/seu-card.png")})`, WebkitMaskSize: "100% 100%" }}
        />
      </div>
      <div className="mt-6 h-6 w-48 rounded-full bg-seu-ink/35 blur-xl" />
    </div>
  );
}
