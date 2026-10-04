"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { withBase } from "@/data/projects";

const VIDEO_ID = "6dCWXfB7nvc";

export default function AboutCompany() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="about" className="relative overflow-hidden px-6 pb-40 pt-32">
      <div className="flex items-start justify-between">
        <Reveal as="h2" className="section-title">
          About company.
        </Reveal>
        <Reveal variant="right" delay={150}>
          <img src={withBase("/brand/logo-wire-green.svg")} alt="" className="slow-spin-y mr-[6vw] w-24 md:w-32" />
        </Reveal>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-[1400px] items-center gap-10 md:grid-cols-[1fr_minmax(0,560px)_1fr]">
        <Reveal variant="left" className="text-[15px] md:self-start md:pt-16">
          Real estate market since 2014.
        </Reveal>

        <div className="relative">
          <Orbits />
          <Reveal variant="mask" className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <img
              src={withBase("/images/choose-varketili.jpg")}
              alt="SEU Varketili aerial render"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#15201d] via-transparent to-[#15201d] opacity-80" />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play SEU Varketili video"
              className="group absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-seu-green shadow-[0_0_40px_#0ea56b80] transition-transform duration-500 hover:scale-110"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-seu-green/40" />
              <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
                <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </Reveal>
        </div>

        <Reveal variant="right" delay={200} className="text-[15px] leading-relaxed md:self-start md:text-right">
          The company&apos;s team, consisting of experienced professionals, cares about continuous development,
          adheres to high construction standards and uses innovative technologies.
        </Reveal>
      </div>

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

/** Dashed concentric rings behind the video, slowly counter-rotating. */
function Orbits() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 -z-0 w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
      viewBox="0 0 800 800"
      fill="none"
      aria-hidden
    >
      <g className="orbit-cw" style={{ transformOrigin: "400px 400px" }}>
        <circle cx="400" cy="400" r="390" stroke="#f3efe9" strokeDasharray="4 8" strokeWidth="1" />
        <circle cx="400" cy="10" r="5" fill="#2ecc71" />
      </g>
      <g className="orbit-ccw" style={{ transformOrigin: "400px 400px" }}>
        <circle cx="400" cy="400" r="320" stroke="#f3efe9" strokeDasharray="4 8" strokeWidth="1" />
      </g>
      <g className="orbit-cw" style={{ transformOrigin: "400px 400px", animationDuration: "140s" }}>
        <circle cx="400" cy="400" r="250" stroke="#f3efe9" strokeDasharray="4 8" strokeWidth="1" />
      </g>
    </svg>
  );
}
