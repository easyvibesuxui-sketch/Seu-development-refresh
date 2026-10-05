"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { roomText, statusText, units, type Unit } from "@/data/inventory";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import ApartmentCard from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import RequestCallModal from "@/components/ui/RequestCallModal";
import { Benefits } from "@/components/project/ProjectDetails";

type Tab = "3D" | "2D" | "Plan";

export default function ApartmentView({ unit }: { unit: Unit }) {
  const [tab, setTab] = useState<Tab>("3D");
  const [asking, setAsking] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const similar = units
    .filter((u) => u.id !== unit.id && u.bedrooms === unit.bedrooms && u.status !== "sold")
    .sort((a, b) => Math.abs(a.totalArea - unit.totalArea) - Math.abs(b.totalArea - unit.totalArea))
    .slice(0, 8);

  useEffect(() => {
    if (!stageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(stageRef.current.querySelector("[data-tab-img]"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
  }, [tab]);

  return (
    <main>
      <section data-tone="dark" className="tone-dark mx-auto grid max-w-[1680px] gap-16 px-gutter pb-section pt-40 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <BackLink href={`/projects/varketili/${unit.block}/`} />
          <div className="mt-10 flex items-baseline gap-10">
            <p className="text-[18px] text-seu-muted">
              Block <span className="title-m ml-2 text-[40px] text-seu-fg">{unit.block.slice(1)}</span>
            </p>
            <p className="text-[18px] text-seu-muted">
              Floor <span className="title-m ml-2 text-[40px] text-seu-fg">{unit.floor}</span>
            </p>
          </div>
          <p className="eyebrow mt-10">SEU Varketili · {statusText[unit.status]}</p>
          <h1 className="page-title mt-4 text-[clamp(52px,6vw,104px)]">
            Apartment {unit.number}<span className="text-seu-accent-hi">.</span>
          </h1>

          <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4" data-stagger>
            {[
              ["Total size", `${unit.totalArea} m²`],
              ["Main size", `${unit.livingArea} m²`],
              ["Open space", `${unit.openArea} m²`],
              ["Bedrooms", unit.bedrooms === 0 ? "Studio" : unit.bedrooms],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="field-label">{k}</dt>
                <dd className="title-m normal-case">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 h-px bg-seu-line" />

          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="field-label">Price</p>
              <p className="title-m text-[clamp(32px,3vw,44px)] normal-case">
                ${unit.price.toLocaleString("en-US")}
                <span className="ml-3 text-[15px] text-seu-muted">${unit.pricePerM2}/m²</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAsking(true)}
              disabled={unit.status === "sold"}
              className="btn btn-primary btn-lg"
            >
              {unit.status === "sold" ? "Sold" : "Request a call"}
            </button>
          </div>

          <h2 className="eyebrow mt-16">Room by room</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-3" data-stagger>
            {unit.rooms.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-seu-line pb-3">
                <span className="text-seu-muted">{roomText[r.kind]}</span>
                <span className="label">{r.area} m²</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">Floor plan</p>
            <a
              href={withBase(`/apartments/${unit.id}/presentation/`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <path d="M2 1h7l4 4v10H2zM9 1v4h4M4.5 9h5M4.5 12h5" />
              </svg>
              See presentation
            </a>
          </div>
          <div ref={stageRef} className="relative mt-4 aspect-[4/3.3] overflow-hidden rounded-[24px] bg-seu-paper">
            <div className="vars-light absolute left-4 top-4 z-10 flex gap-2" role="tablist" aria-label="Layout view">
              {(["3D", "2D", "Plan"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className="chip min-h-10 rounded-full px-4"
                >
                  {t}
                </button>
              ))}
            </div>
            <Compass />
            <div className="absolute inset-0 grid place-items-center p-12">
              {tab === "3D" ? (
                <img data-tab-img src={withBase("/images/apartment-3d.png")} alt={`Apartment ${unit.number}, 3D layout`} className="max-h-full w-[85%] rounded bg-[#313b38] object-contain" />
              ) : (
                <img
                  data-tab-img
                  src={withBase("/images/apartment-plan.png")}
                  alt={`Apartment ${unit.number}, floor plan`}
                  className={`max-h-full w-[75%] object-contain ${tab === "2D" ? "[filter:sepia(.35)_saturate(1.4)_hue-rotate(-12deg)]" : ""}`}
                />
              )}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-seu-muted">Layout images are illustrative for this concept.</p>
        </div>
      </section>

      <Benefits />

      <Section tone="light" className="overflow-hidden">
        <Container>
        <SectionHeader eyebrow="Same size, other floors" title="Similar apartments" />
        </Container>
        <div className="mt-16 flex snap-x scroll-px-gutter gap-6 overflow-x-auto px-gutter pb-6" data-cursor="drag" tabIndex={0} aria-label="Similar apartments, scroll horizontally">
          {similar.map((u) => (
            <ApartmentCard key={u.id} unit={u} className="w-[300px] shrink-0 snap-start" />
          ))}
        </div>
      </Section>

      <RequestCallModal unit={unit} open={asking} onClose={() => setAsking(false)} />
    </main>
  );
}

function Compass() {
  return (
    <div className="compass absolute right-5 top-4 z-10 text-seu-ink" role="img" aria-label="North arrow">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="15" stroke="currentColor" strokeOpacity=".4" />
        <path d="M28 16l4 12-4 12-4-12z" fill="#8b5a3c" />
        <path d="M28 28l4 0-4 12z" fill="#15201d" fillOpacity=".5" />
        {[
          ["N", 28, 7],
          ["S", 28, 54],
          ["W", 4, 31],
          ["E", 52, 31],
        ].map(([l, x, y]) => (
          <text key={l as string} x={x as number} y={y as number} fontSize="8" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
