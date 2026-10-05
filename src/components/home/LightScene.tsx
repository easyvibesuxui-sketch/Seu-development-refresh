"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AmbientVideo from "@/components/ui/AmbientVideo";
import { withBase } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

// The architrave artwork (Kling render, opening cut out) and where its opening sits in it.
const FRAME_RATIO = 3840 / 2143;
const OPENING = { cx: 0.5, cy: 0.514, w: 0.189, h: 0.66 };

/*
 * "Homes made of light": a sunlit interior film seen through a travertine and bronze arched
 * window on a dark wall. Scrolling walks the camera through the window — the wall and frame
 * scale up around the opening until the film fills the screen — while the headline steps
 * aside, then the copy settles in. A tall track with a sticky stage keeps it tied to scroll.
 */
export default function LightScene() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      // Scale at which the opening's straight part covers the whole viewport.
      const throughScale = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cw = Math.max(vw, vh * FRAME_RATIO);
        const ch = cw / FRAME_RATIO;
        return Math.max(vw / (OPENING.w * 0.88 * cw), vh / (OPENING.h * 0.62 * ch)) * 1.08;
      };
      // Explicit start state: a staggered fromTo inside a scrubbed timeline only primes its first target.
      gsap.set(".ls-copy > *", { y: 60, opacity: 0 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.fromTo(".ls-wall", { scale: 1 }, { scale: throughScale, duration: 1, ease: "power2.in" }, 0)
        .fromTo(".ls-media", { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
        .to(".ls-top", { [mobile ? "yPercent" : "xPercent"]: mobile ? -120 : -60, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(".ls-bottom", { [mobile ? "yPercent" : "xPercent"]: mobile ? 120 : 60, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(".ls-wall", { opacity: 0, duration: 0.1 }, 0.74)
        .fromTo(".ls-shade", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.66)
        // The copy only arrives once the wall is gone and the shade is down.
        .to(".ls-copy > *", { y: 0, opacity: 1, stagger: 0.08, duration: 0.25 }, 0.88)
        .to({}, { duration: 0.25 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} data-tone="dark" data-no-out className="tone-dark relative h-[340vh]" aria-label="Homes made of light">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#222a24]">
        {/* The film fills the stage; the wall with its window sits on top of it. */}
        <div className="absolute inset-0 overflow-hidden">
          <AmbientVideo name="light-interior" className="ls-media h-full w-full object-cover" />
          <div className="sunbeams" />
          <div className="ls-shade absolute inset-0 bg-gradient-to-t from-seu-ink/95 via-seu-ink/75 via-45% to-seu-ink/25 opacity-0" />
        </div>

        <div
          className="ls-wall pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
          style={{
            width: `max(100vw, calc(100svh * ${FRAME_RATIO}))`,
            aspectRatio: `${FRAME_RATIO}`,
            translate: "-50% -50%",
            transformOrigin: `${OPENING.cx * 100}% ${OPENING.cy * 100}%`,
          }}
          aria-hidden
        >
          <img src={withBase("/images/arch-frame.webp")} alt="" className="h-full w-full" draggable={false} />
        </div>

        <h2 className="pointer-events-none absolute inset-0 uppercase">
          <span className="ls-top absolute left-1/2 top-[5%] -translate-x-1/2 text-center md:left-[17%] md:top-1/2 md:-translate-y-1/2">
            <span className="title-display block text-[clamp(44px,12vw,96px)] leading-none md:text-[clamp(44px,5.4vw,112px)]">Homes</span>
            <span className="label mt-3 block text-[12px] tracking-[0.5em] text-seu-cream md:text-[13px]">made of</span>
          </span>
          <span className="ls-bottom title-display absolute bottom-[5%] left-1/2 -translate-x-1/2 text-[clamp(44px,12vw,96px)] leading-none text-seu-accent-hi md:bottom-auto md:left-[83%] md:top-1/2 md:-translate-y-1/2 md:text-[clamp(44px,5.4vw,112px)]">
            light
          </span>
        </h2>

        <div className="ls-copy absolute inset-x-gutter bottom-[10vh] grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <p className="title-display text-[clamp(30px,3.4vw,56px)] uppercase leading-[0.98]">
            Planned around
            <br />
            daylight
          </p>
          <div>
            <p className="max-w-md text-[16px] leading-relaxed text-seu-cream md:text-[17px]">
              Open layouts, tall windows and generous balconies let the morning and evening sun reach the rooms you
              actually live in.
            </p>
            <div className="mt-6 flex gap-10">
              {[
                ["3.5 ha", "district"],
                ["2 ha", "of recreation"],
                ["From 45 m²", "apartments"],
              ].map(([v, k]) => (
                <p key={k}>
                  <span className="title-display block text-[clamp(22px,2vw,30px)]">{v}</span>
                  <span className="text-[13px] text-seu-cream">{k}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
