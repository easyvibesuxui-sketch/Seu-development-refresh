"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import LogoMark from "@/components/brand/LogoMark";

// The very first page load has the preloader; only later in-app navigations get the curtain.
let firstRender = true;

/**
 * Re-mounted by app/template.tsx on every navigation: a dark curtain with the wireframe logo
 * covers the screen, then lifts to reveal the new page.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(firstRender);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;
    if (isFirst.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      firstRender = false;
      curtain.style.display = "none";
      return;
    }
    const tl = gsap
      .timeline()
      .fromTo(curtain, { clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut", delay: 0.35 })
      // clearProps: a leftover transform would break fixed/pinned descendants.
      .from(".pt-content", { y: 60, opacity: 0, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity" }, "-=0.55")
      .add(() => {
        curtain.style.display = "none";
      });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <div ref={curtainRef} className="page-curtain" aria-hidden>
        <span className="group">
          <LogoMark className="w-14" color="#c99268" />
        </span>
      </div>
      <div className="pt-content">{children}</div>
    </>
  );
}
