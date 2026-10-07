"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoMark from "@/components/brand/LogoMark";
import { withBase } from "@/data/projects";
import { useT } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_ID = "6dCWXfB7nvc";

// Rings rise from below the fold one after another, largest first, and settle on the centre.
const RINGS = [
  { size: "min(66vmin, 640px)", dash: "4 9", dot: true },
  { size: "min(52vmin, 500px)", dash: "3 8", dot: false },
  { size: "min(40vmin, 380px)", dash: "2 7", dot: true },
];

export default function AboutCompany() {
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const t = useT();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        // A tall track with a sticky stage (no JS pin): the scene holds while it plays, and is
        // done by the time the next section starts sliding over it.
        scrollTrigger: {
          trigger: root,
          // Starts while the section is still coming up, so it never arrives empty.
          start: "top 65%",
          end: () => `top+=${root.offsetHeight - 2 * window.innerHeight} top`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".ac-ring").forEach((ring, i) => {
        tl.fromTo(
          ring,
          { yPercent: 95, scale: 0.85, opacity: 0 },
          { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
          i * 0.5,
        );
      });

      tl.fromTo(
        ".ac-video",
        { clipPath: "inset(48% 48% 48% 48% round 40px)", scale: 1.15, opacity: 0 },
        { clipPath: "inset(0% 0% 0% 0% round 20px)", scale: 1, opacity: 1, duration: 1, ease: "power3.inOut" },
        1.5,
      )
        .from(".ac-play", { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" }, 2.2)
        .fromTo(".ac-left", { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 1.9)
        .fromTo(".ac-right", { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 2.05)
        // Asymmetric drift: the two text columns travel at different speeds and directions.
        .to(".ac-left", { yPercent: -25, duration: 1.2, ease: "none" }, 2.7)
        .to(".ac-right", { yPercent: 25, duration: 1.2, ease: "none" }, 2.7)
        .to(".ac-ring", { rotate: (i: number) => (i % 2 ? -25 : 25), duration: 3.9, ease: "none" }, 0);

      // Held under the incoming section: the stage settles back and fades as it is covered.
      gsap.fromTo(
        ".ac-sticky",
        { scale: 1, opacity: 1 },
        {
          scale: 0.92,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: () => `top+=${root.offsetHeight - 2 * window.innerHeight} top`,
            end: () => `top+=${root.offsetHeight - window.innerHeight} top`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    // The last screen of the track lies under the next section (negative margin), which slides
    // up over the held stage.
    <section id="about" ref={rootRef} data-tone="light" data-no-out className="tone-light relative z-0 mb-[-100svh] h-[360svh]">
      <div className="ac-sticky sticky top-0 isolate h-[100svh] min-h-[640px] origin-top overflow-hidden">
        <div className="relative z-10 mx-auto flex max-w-[1680px] items-start justify-between px-gutter pt-28 md:pt-32">
          <div>
            <p className="eyebrow mb-5">
              <span className="text-seu-accent-hi">01</span>{t("Since 2014", "2014 წლიდან")}
            </p>
            <h2 className="section-title" data-split>
              {t("About company", "კომპანიის შესახებ")}<span className="text-seu-accent-hi">.</span>
            </h2>
          </div>
          <span className="group hidden md:block">
            <LogoMark className="w-20 overflow-visible md:w-24" />
          </span>
        </div>

        {/* Composition area below the title: rings, film and the two notes share one centre line. */}
        <div className="absolute inset-x-0 bottom-0 top-[30%] md:top-[28%]">
          <div className="ac-stage pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative grid place-items-center">
              {RINGS.map((r, i) => (
                <svg
                  key={i}
                  className="ac-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: r.size, height: r.size }}
                  viewBox="0 0 200 200"
                  fill="none"
                  aria-hidden
                >
                  <circle cx="100" cy="100" r="99" stroke="currentColor" strokeOpacity=".45" strokeWidth=".35" strokeDasharray={r.dash} />
                  {r.dot && <circle cx="100" cy="1" r="1.8" fill="var(--seu-accent)" />}
                </svg>
              ))}

              <div className="ac-video pointer-events-auto relative aspect-[16/9] w-[min(440px,74vw)] overflow-hidden rounded-[20px] shadow-[0_30px_80px_rgb(19_33_29/0.25)]">
                <img src={withBase("/images/choose-varketili.jpg")} alt={t("SEU Varketili aerial render", "SEU ვარკეთილის რენდერი ზემოდან")} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-seu-ink/60 via-transparent to-transparent" />
                {/* Centring lives on the wrapper so GSAP can scale the button freely. */}
                <div className="absolute inset-0 grid place-items-center">
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label={t("Play SEU Varketili video", "SEU ვარკეთილის ვიდეოს ჩართვა")}
                    data-cursor="play"
                    className="ac-play relative grid h-16 w-16 place-items-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md transition-[background-color] duration-500 hover:bg-seu-accent"
                  >
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/25" />
                    <svg width="20" height="22" viewBox="0 0 22 24" fill="none" aria-hidden className="relative ml-1">
                      <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side notes share the header's container and the composition's centre line. */}
          <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-[1680px] items-end justify-between px-gutter pb-10 lg:items-center lg:pb-0">
            <p className="ac-left title-m hidden max-w-[220px] lg:block">{t("Real estate market since 2014.", "უძრავი ქონების ბაზარზე 2014 წლიდან.")}</p>
            <p className="ac-right body-copy ml-auto max-w-[320px] text-right">
              {t(
                "The company's team, consisting of experienced professionals, cares about continuous development, adheres to high construction standards and uses innovative technologies.",
                "კომპანიის გუნდი, რომელიც გამოცდილ პროფესიონალებს აერთიანებს, ზრუნავს მუდმივ განვითარებაზე, იცავს მშენებლობის მაღალ სტანდარტებს და იყენებს ინოვაციურ ტექნოლოგიებს.",
              )}
            </p>
          </div>
        </div>
      </div>

      {playing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("SEU Varketili video", "SEU ვარკეთილის ვიდეო")}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-6 backdrop-blur-md"
          onClick={() => setPlaying(false)}
        >
          <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title="SEU Varketili"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button type="button" className="btn btn-glass absolute right-6 top-6" onClick={() => setPlaying(false)} autoFocus>
            {t("Close", "დახურვა")}
          </button>
        </div>
      )}
    </section>
  );
}
