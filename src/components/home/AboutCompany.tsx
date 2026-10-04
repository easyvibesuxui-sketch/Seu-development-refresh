"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoMark from "@/components/brand/LogoMark";
import { withBase } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_ID = "6dCWXfB7nvc";

// Rings rise from below the fold one after another, largest first, and settle on the centre.
const RINGS = [
  { size: "min(92vmin, 980px)", dash: "4 9", dot: true },
  { size: "min(72vmin, 760px)", dash: "3 8", dot: false },
  { size: "min(54vmin, 560px)", dash: "2 7", dot: true },
];

export default function AboutCompany() {
  const rootRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: root, start: "top top", end: "+=160%", pin: true, scrub: 0.8 },
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
        { clipPath: "inset(0% 0% 0% 0% round 12px)", scale: 1, opacity: 1, duration: 1, ease: "power3.inOut" },
        1.5,
      )
        .from(".ac-play", { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" }, 2.2)
        .fromTo(".ac-left", { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 1.9)
        .fromTo(".ac-right", { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 2.05)
        // Asymmetric drift: the two text columns travel at different speeds and directions.
        .to(".ac-left", { yPercent: -60, duration: 1.2, ease: "none" }, 2.7)
        .to(".ac-right", { yPercent: 45, duration: 1.2, ease: "none" }, 2.7)
        .to(".ac-stage", { yPercent: -6, duration: 1.2, ease: "none" }, 2.7)
        .to(".ac-ring", { rotate: (i: number) => (i % 2 ? -25 : 25), duration: 3.9, ease: "none" }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={rootRef} className="relative isolate h-[100svh] min-h-[640px] overflow-hidden">
      <div className="relative z-10 flex items-start justify-between px-6 pt-32 md:px-12">
        <h2 className="section-title" data-split>
          About company.
        </h2>
        <span className="group mr-[6vw] hidden md:block">
          <LogoMark className="w-24 overflow-visible md:w-28" />
        </span>
      </div>

      <div className="ac-stage pointer-events-none absolute inset-0 grid place-items-center">
        {RINGS.map((r, i) => (
          <svg
            key={i}
            className="ac-ring absolute"
            style={{ width: r.size, height: r.size }}
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <circle cx="100" cy="100" r="99" stroke="#f3efe9" strokeOpacity=".45" strokeWidth=".35" strokeDasharray={r.dash} />
            {r.dot && <circle cx="100" cy="1" r="1.6" fill="#b8835a" />}
          </svg>
        ))}

        <div className="ac-video pointer-events-auto relative aspect-[16/9] w-[min(560px,72vw)] overflow-hidden rounded-xl">
          <img
            src={withBase("/images/choose-varketili.jpg")}
            alt="SEU Varketili aerial render"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15201d]/60 via-transparent to-transparent" />
          {/* Centring lives on the wrapper so GSAP can scale the button freely. */}
          <div className="absolute inset-0 grid place-items-center">
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play SEU Varketili video"
              data-cursor="play"
              className="ac-play relative grid h-16 w-16 place-items-center rounded-full bg-seu-accent/90 shadow-[0_0_30px_#8b5a3c66] transition-[background-color] duration-500 hover:bg-seu-accent-hi"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-seu-accent/30" />
              <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden className="relative ml-1">
                <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="ac-left absolute left-6 md:left-12 top-[22%] z-10 max-w-[220px] text-[15px] md:top-[42%]">
        Real estate market since 2014.
      </p>
      <p className="ac-right absolute bottom-[12%] right-6 md:right-12 z-10 max-w-[340px] text-right text-[15px] leading-relaxed md:bottom-auto md:top-[38%]">
        The company&apos;s team, consisting of experienced professionals, cares about continuous development,
        adheres to high construction standards and uses innovative technologies.
      </p>

      {playing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SEU Varketili video"
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
          <button
            type="button"
            className="absolute right-6 top-6 text-sm tracking-[0.1em]"
            onClick={() => setPlaying(false)}
          >
            CLOSE ✕
          </button>
        </div>
      )}
    </section>
  );
}
