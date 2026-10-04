"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * Site-wide scroll motion, driven by data attributes so pages stay declarative:
 *   data-split            heading reveals word by word from a mask as it enters
 *   data-parallax="0.2"   element drifts at a different speed than the page (negative = up)
 *   data-zoom             image eases from 1.25x to 1x while it crosses the viewport
 *   data-stagger          direct children rise in sequence on enter
 *   data-window           clip opens from a rounded inset window to full bleed on enter
 *   data-drift="-0.3"     row slides sideways by that share of its width across the viewport
 *   data-section-out      section lags, shrinks and dims as it leaves (desktop)
 * Lenis provides the inertial scroll (one instance for the whole visit); the attribute
 * effects are rebuilt on every route change.
 */
export default function ScrollFX() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
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

    return () => {
      mo.disconnect();
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();
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

      // A framed image opens from a rounded inset window to full bleed as it enters.
      gsap.utils.toArray<HTMLElement>("[data-window]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(10% 12% 0% 12% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 15%", scrub: 0.5 },
          },
        );
      });

      // Rows of lettering slide sideways; the value is the share of their width travelled.
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
        const amount = Number(el.dataset.drift) || -0.3;
        gsap.fromTo(
          el,
          { xPercent: amount < 0 ? 0 : -amount * 100 },
          {
            xPercent: amount < 0 ? amount * 100 : 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Leaving sections fall behind: they lag, shrink a touch and dim as they scroll away, so
      // the next one seems to slide over them. Desktop pointers only.
      mm.add("(min-width: 1024px) and (pointer: fine)", () => {
        gsap.utils.toArray<HTMLElement>("[data-section-out]").forEach((el) => {
          gsap.to(el, {
            y: () => window.innerHeight * 0.14,
            scale: 0.97,
            opacity: 0.2,
            ease: "none",
            transformOrigin: "50% 100%",
            scrollTrigger: { trigger: el, start: "bottom 75%", end: "bottom top", scrub: true },
          });
        });
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
    const timer = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      ctx.revert();
      mm.revert();
      window.clearTimeout(timer);
      window.removeEventListener("load", refresh);
    };
  }, [pathname]);

  return null;
}
