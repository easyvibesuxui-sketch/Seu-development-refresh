"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AmbientVideo from "@/components/ui/AmbientVideo";

gsap.registerPlugin(ScrollTrigger);

const ARCH = "inset(16% 37% 10% 37% round 13vw 13vw 0px 0px)";
const ARCH_MOBILE = "inset(26% 12% 20% 12% round 38vw 38vw 0px 0px)";

/*
 * "Homes made of light": a sunlit interior film seen through an arched window. Scrolling opens
 * the arch to the full screen while the headline parts around it, then the copy settles in.
 * The section is a tall track with a sticky stage, so the motion follows the scroll exactly.
 */
export default function LightScene() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.fromTo(
        ".ls-window",
        { clipPath: mobile ? ARCH_MOBILE : ARCH },
        { clipPath: "inset(0% 0% 0% 0% round 0vw 0vw 0px 0px)", duration: 1 },
        0,
      )
        .fromTo(".ls-media", { scale: 1.35 }, { scale: 1, duration: 1 }, 0)
        // The words part around the opening arch: sideways on desktop, up and down on phones.
        .to(".ls-top", { [mobile ? "yPercent" : "xPercent"]: mobile ? -140 : -45, opacity: 0, duration: 0.6 }, 0)
        .to(".ls-bottom", { [mobile ? "yPercent" : "xPercent"]: mobile ? 140 : 45, opacity: 0, duration: 0.6 }, 0)
        .to(".ls-mid", { opacity: 0, duration: 0.3 }, 0)
        .fromTo(".ls-shade", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
        .fromTo(".ls-copy > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.3 }, 0.75)
        .to({}, { duration: 0.25 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative h-[320vh]" aria-label="Homes made of light">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="ls-window absolute inset-0 overflow-hidden" style={{ clipPath: ARCH }}>
          <AmbientVideo name="light-interior" className="ls-media h-full w-full object-cover" />
          <div className="sunbeams" />
          <div className="ls-shade absolute inset-0 bg-gradient-to-t from-[#15201d]/90 via-[#15201d]/35 to-[#15201d]/10 opacity-0" />
        </div>

        <h2 className="pointer-events-none absolute inset-0 uppercase">
          <span className="ls-top title-display absolute left-1/2 top-[7%] -translate-x-1/2 text-[clamp(64px,19vw,200px)] leading-none md:left-[3vw] md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:text-[clamp(56px,10.5vw,200px)]">
            Homes
          </span>
          <span className="ls-mid label absolute left-1/2 top-[19%] -translate-x-1/2 text-[12px] tracking-[0.5em] text-seu-cream/80 md:top-[9%] md:text-[14px]">
            made of
          </span>
          <span className="ls-bottom title-display absolute bottom-[5%] left-1/2 -translate-x-1/2 text-[clamp(64px,19vw,200px)] leading-none text-seu-accent-hi md:bottom-auto md:left-auto md:right-[3vw] md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:text-[clamp(56px,10.5vw,200px)]">
            light
          </span>
        </h2>

        <div className="ls-copy absolute inset-x-6 bottom-[10vh] grid gap-8 md:inset-x-12 md:grid-cols-[1.2fr_1fr] md:items-end">
          <p className="title-display text-[clamp(34px,4.4vw,72px)] uppercase leading-[0.95]">
            Planned around
            <br />
            daylight
          </p>
          <div>
            <p className="max-w-md text-[16px] leading-relaxed text-seu-cream/85 md:text-[17px]">
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
                  <span className="text-[13px] text-seu-muted">{k}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
