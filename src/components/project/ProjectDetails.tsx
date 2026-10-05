"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoMark from "@/components/brand/LogoMark";
import { statusLabel, withBase, type Project } from "@/data/projects";
import { benefits, bedroomText, units } from "@/data/inventory";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

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
    <Section tone="dark" className="py-24">
      <Container>
        <div ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-14 border-y border-seu-line py-14 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="field-label">{s.label}</p>
              <p className="title-m mt-3 text-[clamp(24px,2.2vw,38px)] normal-case">
                {typeof s.value === "number" ? <span data-count={s.value}>{s.value}</span> : s.value}
                {s.suffix}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function AboutProject({ project, address, text, award }: { project: Project; address: string; text: string; award?: string }) {
  return (
    <Section tone="light">
      <Container>
        <SectionHeader
          eyebrow={`${statusLabel[project.status]} · ${project.date}`}
          title="About project"
          action={
            <span className="group hidden md:block">
              <LogoMark className="w-24 overflow-visible" />
            </span>
          }
        />
        <div className="mt-20 grid gap-16 md:grid-cols-2">
          <div>
            <p className="lead flex items-center gap-3">
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
              className="group relative mt-6 block h-72 overflow-hidden rounded-[24px] bg-seu-ink"
            >
              <img
                src={withBase("/images/choose-varketili.jpg")}
                alt=""
                className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
              />
              <span className="btn btn-glass btn-sm absolute bottom-5 left-5 text-white">Open in Google Maps ↗</span>
            </a>
          </div>
          <div data-stagger>
            <p className="lead">{text}</p>
            {award && <p className="mt-8 border-l-2 border-seu-accent pl-6 text-[16px] leading-[1.8] text-seu-accent-hi">{award}</p>}
          </div>
        </div>
      </Container>
    </Section>
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
    <Section tone="dark" className="overflow-hidden">
      <Container className="grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div>
        <SectionHeader eyebrow="Why SEU" title="Benefits" className="lg:grid-cols-1" />
        <ul className="mt-12 space-y-4" data-stagger>
          {benefits.map((b) => (
            <li key={b} className="lead flex items-center gap-4">
              <span className="h-px w-5 shrink-0 bg-seu-accent-hi" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="overflow-hidden">
          <div ref={trackRef} className="flex gap-[2%]">
            {SLIDES.map((src, i) => (
              <div key={src + i} className="relative aspect-[3/4] w-[53%] shrink-0 overflow-hidden rounded-[20px] md:aspect-[4/5]">
                <img
                  src={withBase(src)}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-[1.4s] ${i === index ? "scale-100" : "scale-110"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-seu-ink/50 via-transparent to-seu-ink/80" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-3">
            <ArrowButton dir="prev" onClick={() => go(-1)} label="Previous image" />
            <ArrowButton dir="next" onClick={() => go(1)} label="Next image" />
          </div>
          <p className="title-m tabular-nums" aria-live="polite">
            {String(index + 1).padStart(2, "0")}
            <span className="text-seu-muted">/{String(SLIDES.length).padStart(2, "0")}</span>
          </p>
        </div>
      </div>
      </Container>
    </Section>
  );
}

export function ArrowButton({ dir, onClick, label }: { dir: "prev" | "next" | "up" | "down"; onClick: () => void; label?: string }) {
  const rotate = { prev: 180, next: 0, up: -90, down: 90 }[dir];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? dir}
      className="btn btn-icon"
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
    <Section tone="dark">
      <Container>
        <SectionHeader eyebrow="Walk through" title="Virtual tour" />
      </Container>
      <div className="relative mx-gutter mt-20 h-[78vh] min-h-[420px] overflow-hidden rounded-[24px]" data-cursor="play" data-window>
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
            <div className="absolute inset-0 bg-gradient-to-b from-seu-ink/80 via-transparent to-seu-ink/80" />
            <span className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur-md transition-[transform,background-color] duration-500 group-hover:scale-110 group-hover:bg-seu-accent">
              <svg width="26" height="28" viewBox="0 0 22 24" fill="none" className="ml-1" aria-hidden>
                <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </Section>
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
    <Section tone="light">
      <Container>
      <SectionHeader eyebrow="Layouts" title="Apartment types" />
      <ul className="mt-16 border-t border-seu-line" data-stagger>
        {types.map((t) => (
          <li key={t.bedrooms}>
            <Link
              href={`/search/?project=${projectId}&rooms=${t.bedrooms}`}
              className="group grid grid-cols-[72px_1fr_auto] items-center gap-6 border-b border-seu-line py-6 transition-colors hover:bg-seu-field md:grid-cols-[96px_1.2fr_1fr_1fr_auto]"
            >
              <span className="block aspect-square overflow-hidden rounded-[12px] bg-white">
                <img src={withBase("/images/apartment-plan.png")} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </span>
              <span className="title-m">{bedroomText(t.bedrooms)}</span>
              <span className="hidden text-[16px] md:block">
                {t.min}–{t.max} m²
              </span>
              <span className="hidden text-[16px] text-seu-muted md:block">
                from ${t.from.toLocaleString("en-US")} · {t.count} available
              </span>
              <span className="btn btn-icon transition-transform group-hover:translate-x-1" aria-hidden>
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
                  <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </Container>
    </Section>
  );
}
