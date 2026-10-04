"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoMark from "@/components/brand/LogoMark";
import { statusLabel, withBase, type Project } from "@/data/projects";
import { benefits, bedroomText, units } from "@/data/inventory";

gsap.registerPlugin(ScrollTrigger);

type Stat = { label: string; value: number | string; suffix?: string };

export function ProjectStats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((n) => {
        const to = Number(n.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => (n.textContent = String(Math.round(obj.v))),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="mx-auto grid max-w-5xl grid-cols-2 gap-y-12 px-6 py-24 text-center md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-[14px] text-seu-muted">{s.label}</p>
          <span className="mx-auto my-3 block h-2 w-2 rounded-full border border-seu-muted" />
          <p className="title-display text-[clamp(20px,1.8vw,26px)]">
            {typeof s.value === "number" ? <span data-count={s.value}>{s.value}</span> : s.value}
            {s.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AboutProject({ project, address, text, award }: { project: Project; address: string; text: string; award?: string }) {
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title" data-split>
            About Project.
          </h2>
          <p className="label mt-4 flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] text-seu-muted">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
              <path d="M1 15V1h10l-2 3.5L11 8H1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {statusLabel[project.status]} {project.date}
          </p>
        </div>
        <span className="group hidden md:block">
          <LogoMark className="w-24 overflow-visible" />
        </span>
      </div>
      <div className="mt-16 grid gap-16 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-[15px]">
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
              <path d="M6 15s5-5.5 5-9A5 5 0 0 0 1 6c0 3.5 5 9 5 9z" />
              <circle cx="6" cy="6" r="1.8" />
            </svg>
            {address}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${project.coords?.[1]},${project.coords?.[0]}`}
            target="_blank"
            rel="noreferrer"
            className="group relative mt-4 block h-56 overflow-hidden rounded-lg border border-white/40 bg-[#1c2522]"
          >
            <img
              src={withBase("/images/choose-varketili.jpg")}
              alt=""
              className="h-full w-full object-cover opacity-40 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-60"
            />
            <span className="label absolute bottom-4 left-4 rounded bg-[#0e1a16]/85 px-3 py-1.5 text-[12px] uppercase tracking-[0.1em]">
              Open in Google Maps ↗
            </span>
          </a>
        </div>
        <div className="md:text-right" data-stagger>
          <p className="label text-[13px] uppercase tracking-[0.14em] text-seu-muted">About project</p>
          <p className="mt-6 text-[16px] leading-[1.9]">{text}</p>
          {award && <p className="mt-6 text-[16px] leading-[1.9] text-seu-accent-hi">{award}</p>}
        </div>
      </div>
    </section>
  );
}

const SLIDES = ["/images/upcoming-1.jpg", "/images/varketili-panorama.jpg", "/images/choose-varketili.jpg", "/images/upcoming-2.jpg", "/images/finished-vaja.jpg"];

export function Benefits() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    gsap.to(track, { xPercent: -index * 55, duration: 1, ease: "expo.inOut" });
  }, [index]);

  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="grid gap-12 overflow-hidden px-6 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-12">
      <div>
        <h2 className="title-display text-[clamp(28px,2.4vw,38px)]" data-split>
          Benefits
        </h2>
        <ul className="mt-8 space-y-3 text-[16px]" data-stagger>
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="h-px w-4 bg-seu-accent-hi" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="overflow-hidden">
          <div ref={trackRef} className="flex gap-[2%]">
            {SLIDES.map((src, i) => (
              <div key={src + i} className="relative aspect-[3/4] w-[53%] shrink-0 overflow-hidden md:aspect-[4/5]">
                <img
                  src={withBase(src)}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-[1.4s] ${i === index ? "scale-100" : "scale-110"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/50 via-transparent to-[#15201d]/80" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-3">
            <ArrowButton dir="prev" onClick={() => go(-1)} />
            <ArrowButton dir="next" onClick={() => go(1)} />
          </div>
          <p className="title-display text-[32px] tabular-nums">
            {String(index + 1).padStart(2, "0")}
            <span className="text-seu-muted">/{String(SLIDES.length).padStart(2, "0")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function ArrowButton({ dir, onClick, label }: { dir: "prev" | "next" | "up" | "down"; onClick: () => void; label?: string }) {
  const rotate = { prev: 180, next: 0, up: -90, down: 90 }[dir];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? dir}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/50 transition-colors hover:border-seu-accent-hi hover:bg-seu-accent"
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ transform: `rotate(${rotate}deg)` }} aria-hidden>
        <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  );
}

export function VirtualTour({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="py-24">
      <h2 className="section-title px-6 md:px-12" data-split>
        Virtual Tour.
      </h2>
      <div className="relative mt-14 h-[70vh] min-h-[420px] overflow-hidden" data-cursor="play" data-window>
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title="SEU Varketili virtual tour"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label="Play virtual tour">
            <div className="absolute inset-0" data-zoom>
              <img src={withBase("/images/sun-interior.jpg")} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="sunbeams" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/80 via-transparent to-[#15201d]/80" />
            <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-seu-accent/90 shadow-[0_0_40px_#8b5a3c80] transition-transform duration-500 group-hover:scale-110">
              <svg width="26" height="28" viewBox="0 0 22 24" fill="none" className="ml-1" aria-hidden>
                <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

export function ApartmentTypes({ projectId }: { projectId: string }) {
  const own = units.filter((u) => u.project === projectId);
  const types = [0, 1, 2, 3]
    .map((b) => {
      const list = own.filter((u) => u.bedrooms === b);
      if (!list.length) return null;
      const areas = list.map((u) => u.totalArea);
      const prices = list.map((u) => u.price);
      return { bedrooms: b, min: Math.min(...areas), max: Math.max(...areas), from: Math.min(...prices), count: list.filter((u) => u.status === "available").length };
    })
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <section className="px-6 py-24 md:px-12">
      <h2 className="section-title" data-split>
        Apartment Types.
      </h2>
      <ul className="mt-14" data-stagger>
        {types.map((t) => (
          <li key={t.bedrooms}>
            <Link
              href={`/search/?project=${projectId}&rooms=${t.bedrooms}`}
              className="group grid grid-cols-[72px_1fr_auto] items-center gap-6 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.03] md:grid-cols-[96px_1.2fr_1fr_1fr_auto]"
            >
              <span className="block aspect-square overflow-hidden rounded bg-seu-cream">
                <img src={withBase("/images/apartment-plan.png")} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </span>
              <span className="label text-[17px]">{bedroomText(t.bedrooms)}</span>
              <span className="hidden text-[16px] md:block">
                {t.min}–{t.max} m²
              </span>
              <span className="hidden text-[16px] text-seu-muted md:block">
                from ${t.from.toLocaleString("en-US")} · {t.count} available
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-white/50 transition-[background-color,transform] duration-500 group-hover:translate-x-1 group-hover:bg-seu-accent">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
                  <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
