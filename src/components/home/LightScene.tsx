"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AmbientVideo from "@/components/ui/AmbientVideo";

gsap.registerPlugin(ScrollTrigger);

const ARCH = "inset(16% 37% 10% 37% round 13vw 13vw 0px 0px)";
const ARCH_MOBILE = "inset(26% 12% 20% 12% round 38vw 38vw 0px 0px)";
// The same opening as CSS variables, so the architrave frame can follow the clip exactly.
const FRAME = { "--t": "16%", "--l": "37%", "--r": "37%", "--b": "10%", "--rad": "13vw" };
const FRAME_MOBILE = { "--t": "26%", "--l": "12%", "--r": "12%", "--b": "20%", "--rad": "38vw" };

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
        .fromTo(
          ".ls-frame",
          { ...(mobile ? FRAME_MOBILE : FRAME), opacity: 1 },
          { "--t": "0%", "--l": "0%", "--r": "0%", "--b": "0%", "--rad": "0vw", duration: 1 },
          0,
        )
        .to(".ls-frame", { opacity: 0, duration: 0.35 }, 0.45)
        // The words part around the opening arch: sideways on desktop, up and down on phones.
        .to(".ls-top", { [mobile ? "yPercent" : "xPercent"]: mobile ? -140 : -110, opacity: 0, duration: 0.32, ease: "power2.in" }, 0)
        .to(".ls-bottom", { [mobile ? "yPercent" : "xPercent"]: mobile ? 140 : 110, opacity: 0, duration: 0.32, ease: "power2.in" }, 0)
        .to(".ls-mid", { opacity: 0, duration: 0.3 }, 0)
        .fromTo(".ls-shade", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
        .fromTo(".ls-copy > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.3 }, 0.75)
        .to({}, { duration: 0.25 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} data-tone="dark" data-no-out className="tone-dark relative h-[320vh]" aria-label="Homes made of light">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="ls-window absolute inset-0 overflow-hidden" style={{ clipPath: ARCH }}>
          <AmbientVideo name="light-interior" className="ls-media h-full w-full object-cover" />
          <div className="sunbeams" />
          <div className="ls-shade absolute inset-0 bg-gradient-to-t from-seu-ink/90 via-seu-ink/35 to-seu-ink/10 opacity-0" />
        </div>

        {/* Architrave around the opening: glow spill, stepped mouldings, a bronze band with a
            fine inner bead, pilasters with fluting, imposts at the spring line, a keystone and a
            stone sill. Everything is placed from the opening's CSS variables, so it opens with it. */}
        <div className="ls-frame pointer-events-none absolute inset-0" style={FRAME as CSSProperties} aria-hidden>
          <span className="arch-glow" />
          <span className="arch-moulding arch-moulding--outer" />
          <span className="arch-moulding arch-moulding--mid" />
          <span className="arch-band" />
          <span className="arch-bead" />
          <span className="arch-pilaster arch-pilaster--left" />
          <span className="arch-pilaster arch-pilaster--right" />
          <span className="arch-impost arch-impost--left" />
          <span className="arch-impost arch-impost--right" />
          <span className="arch-keystone" />
          <span className="arch-sill" />
        </div>

        <h2 className="pointer-events-none absolute inset-0 uppercase">
          <span className="ls-top title-display absolute left-1/2 top-[7%] -translate-x-1/2 text-[clamp(48px,14vw,120px)] leading-none md:left-[18.5%] md:top-1/2 md:-translate-y-1/2 md:text-[clamp(44px,6vw,124px)]">
            Homes
          </span>
          <span className="ls-mid label absolute left-1/2 top-[19%] -translate-x-1/2 text-[12px] tracking-[0.5em] text-seu-cream/80 md:top-[9%] md:text-[14px]">
            made of
          </span>
          <span className="ls-bottom title-display absolute bottom-[5%] left-1/2 -translate-x-1/2 text-[clamp(48px,14vw,120px)] leading-none text-seu-accent-hi md:bottom-auto md:left-[81.5%] md:top-1/2 md:-translate-y-1/2 md:text-[clamp(44px,6vw,124px)]">
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
