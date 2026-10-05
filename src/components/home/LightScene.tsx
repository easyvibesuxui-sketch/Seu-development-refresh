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

        {/* Architrave: an outer hairline, an inner cognac band, a keystone and a stone sill. */}
        <div className="ls-frame pointer-events-none absolute inset-0" style={FRAME as CSSProperties} aria-hidden>
          <span className="absolute rounded-t-[calc(var(--rad)+22px)] border border-b-0 border-seu-cream/30 [inset:calc(var(--t)-22px)_calc(var(--r)-22px)_calc(var(--b)-0px)_calc(var(--l)-22px)]" />
          <span className="absolute rounded-t-[calc(var(--rad)+9px)] border-[1.5px] border-b-0 border-[#e39a62]/80 shadow-[0_0_40px_rgb(227_154_98/0.25)] [inset:calc(var(--t)-9px)_calc(var(--r)-9px)_calc(var(--b)-0px)_calc(var(--l)-9px)]" />
          <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-[#e39a62] bg-seu-bg [top:calc(var(--t)-28px)]" />
          <span className="absolute h-4 border-t border-seu-cream/50 bg-gradient-to-b from-seu-cream/10 to-transparent [bottom:calc(var(--b)-16px)] [left:calc(var(--l)-48px)] [right:calc(var(--r)-48px)]" />
        </div>

        <h2 className="pointer-events-none absolute inset-0 uppercase">
          <span className="ls-top title-display absolute left-1/2 top-[7%] -translate-x-1/2 text-[clamp(56px,17vw,160px)] leading-none md:left-[18.5%] md:top-1/2 md:-translate-y-1/2 md:text-[clamp(48px,7.6vw,168px)]">
            Homes
          </span>
          <span className="ls-mid label absolute left-1/2 top-[19%] -translate-x-1/2 text-[12px] tracking-[0.5em] text-seu-cream/80 md:top-[9%] md:text-[14px]">
            made of
          </span>
          <span className="ls-bottom title-display absolute bottom-[5%] left-1/2 -translate-x-1/2 text-[clamp(56px,17vw,160px)] leading-none text-seu-accent-hi md:bottom-auto md:left-[81.5%] md:top-1/2 md:-translate-y-1/2 md:text-[clamp(48px,7.6vw,168px)]">
            light
          </span>
        </h2>

        <div className="ls-copy absolute inset-x-gutter bottom-[10vh] grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
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
