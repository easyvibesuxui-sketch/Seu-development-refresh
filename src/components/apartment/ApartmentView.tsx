"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { roomText, units, type Unit } from "@/data/inventory";
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
    <main className="pt-28">
      <section className="grid gap-12 px-6 md:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <BackLink href={`/projects/varketili/${unit.block}/`} />
          <div className="mt-10 flex items-baseline gap-10">
            <p className="text-[18px] text-seu-muted">
              Block <span className="title-display ml-2 text-[34px] text-seu-fg">{unit.block.slice(1)}</span>
            </p>
            <p className="text-[18px] text-seu-muted">
              Floor <span className="title-display ml-2 text-[34px] tracking-[0.1em] text-seu-fg">{unit.floor}</span>
            </p>
          </div>
          <p className="mt-6 text-[20px] text-seu-muted">
            Apartment N <span className="title-display ml-2 text-[clamp(44px,4vw,60px)] text-seu-fg">{unit.number}</span>
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4" data-stagger>
            {[
              ["Total size", `${unit.totalArea} m²`],
              ["Main size", `${unit.livingArea} m²`],
              ["Open space", `${unit.openArea} m²`],
              ["Bedrooms", unit.bedrooms === 0 ? "Studio" : unit.bedrooms],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-[14px] text-seu-muted">{k}</dt>
                <dd className="title-display mt-1 text-[22px]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 h-px bg-gradient-to-r from-white/40 via-white/40 to-transparent" />

          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="text-[14px] text-seu-muted">Price</p>
              <p className="title-display text-[30px]">
                ${unit.price.toLocaleString("en-US")}
                <span className="ml-3 text-[15px] text-seu-muted">${unit.pricePerM2}/m²</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAsking(true)}
              disabled={unit.status === "sold"}
              className="label rounded-md bg-seu-accent px-10 py-4 text-[14px] uppercase tracking-[0.14em] transition-colors hover:bg-seu-accent-hi disabled:cursor-not-allowed disabled:opacity-40"
            >
              {unit.status === "sold" ? "Sold" : "Request call"}
            </button>
          </div>

          <h2 className="title-display mt-14 text-[24px]">Details</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-3" data-stagger>
            {unit.rooms.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <span className="text-seu-muted">{roomText[r.kind]}</span>
                <span className="label">{r.area} m²</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-seu-muted">Floor plan</p>
            <a
              href={withBase(`/apartments/${unit.id}/presentation/`)}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-2 rounded-md border border-seu-accent px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-seu-accent"
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <path d="M2 1h7l4 4v10H2zM9 1v4h4M4.5 9h5M4.5 12h5" />
              </svg>
              See presentation
            </a>
          </div>
          <div ref={stageRef} className="relative mt-4 aspect-[4/3.3] overflow-hidden rounded-md bg-seu-cream">
            <div className="absolute left-4 top-4 z-10 flex gap-2" role="tablist">
              {(["3D", "2D", "Plan"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className="label rounded-md border border-[#15201d]/25 px-4 py-1.5 text-[13px] text-[#15201d] transition-colors aria-selected:border-seu-accent aria-selected:bg-seu-accent aria-selected:text-white"
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

      <section className="overflow-hidden px-6 py-24 md:px-12">
        <h2 className="section-title" data-split>
          Similar Apartments.
        </h2>
        <div className="-mx-6 mt-14 flex snap-x scroll-px-6 gap-6 overflow-x-auto px-6 pb-6 md:-mx-12 md:scroll-px-12 md:px-12" data-cursor="drag">
          {similar.map((u) => (
            <ApartmentCard key={u.id} unit={u} className="w-[300px] shrink-0 snap-start" />
          ))}
        </div>
      </section>

      <RequestCallModal unit={unit} open={asking} onClose={() => setAsking(false)} />
    </main>
  );
}

function Compass() {
  return (
    <div className="compass absolute right-5 top-4 z-10 text-[#15201d]" aria-label="North arrow">
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
