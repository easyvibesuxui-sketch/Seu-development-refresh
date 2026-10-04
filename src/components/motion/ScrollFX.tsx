"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * Site-wide scroll motion, driven by data attributes so sections stay declarative:
 *   data-split            heading reveals word by word from a mask as it enters
 *   data-parallax="0.2"   element drifts at a different speed than the page (negative = up)
 *   data-zoom             image eases from 1.25x to 1x while it crosses the viewport
 *   data-stagger          direct children rise in sequence on enter
 * Lenis provides the inertial scroll; ScrollTrigger reads from it.
 */
export default function ScrollFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = reduce ? null : new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      // Hold the page still while the preloader is up.
      const html = document.documentElement;
      const sync = () => (html.classList.contains("is-loading") ? lenis.stop() : lenis.start());
      sync();
      const mo = new MutationObserver(sync);
      mo.observe(html, { attributes: true, attributeFilter: ["class"] });
      // In-page anchors scroll smoothly too.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        const id = a?.getAttribute("href");
        if (!a || !id || id === "#" || !document.querySelector(id)) return;
        e.preventDefault();
        lenis.scrollTo(id, { offset: 0, duration: 1.6 });
      };
      document.addEventListener("click", onClick);
      (lenis as Lenis & { _cleanup?: () => void })._cleanup = () => {
        mo.disconnect();
        document.removeEventListener("click", onClick);
      };
    }

    if (reduce) return () => undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const split = SplitText.create(el, { type: "words,lines", mask: "lines", linesClass: "split-line" });
        gsap.from(split.words, {
          yPercent: 110,
          rotate: 4,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.15;
        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: -speed * 100,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-zoom]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    });

    // Fonts and images change layout; re-measure once everything has settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      ctx.revert();
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      (lenis as (Lenis & { _cleanup?: () => void }) | null)?._cleanup?.();
      lenis?.destroy();
    };
  }, []);

  return null;
}
