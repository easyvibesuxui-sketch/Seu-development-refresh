"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { roomText, statusText, units, viewText, type RoomKind, type Unit, type ViewId } from "@/data/inventory";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import ApartmentCard from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import RequestCallModal from "@/components/ui/RequestCallModal";
import { Benefits } from "@/components/project/ProjectDetails";
import Icon, { type IconName } from "@/components/ui/Icon";
import FloorPlanSheet from "./FloorPlanSheet";

// The sun study brings MapLibre; load it only when asked for.
const SunStudy = dynamic(() => import("@/components/project/SunStudy"), { ssr: false });

const roomIcon: Record<RoomKind, IconName> = {
  living: "sofa",
  kitchen: "kitchen",
  bedroom: "bed",
  bathroom: "bath",
  wc: "wc",
  hall: "hall",
  balcony: "balcony",
  storage: "storage",
};

const viewIcon: Record<ViewId, IconName> = {
  park: "park",
  city: "city",
  sea: "sea",
  mountains: "mountains",
  courtyard: "courtyard",
  panorama: "panorama",
};

type Tab = "3D" | "2D" | "Plan";

export default function ApartmentView({ unit }: { unit: Unit }) {
  const [tab, setTab] = useState<Tab>("3D");
  const [asking, setAsking] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [sun, setSun] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const similar = units
    .filter((u) => u.id !== unit.id && u.bedrooms === unit.bedrooms && u.status !== "sold")
    .sort((a, b) => Math.abs(a.totalArea - unit.totalArea) - Math.abs(b.totalArea - unit.totalArea))
    .slice(0, 8);

  const closeSheet = useCallback(() => setSheet(false), []);
  const closeSun = useCallback(() => setSun(false), []);

  useEffect(() => {
    if (!stageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(stageRef.current.querySelector("[data-tab-img]"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
  }, [tab]);

  return (
    <main>
      <section data-tone="dark" className="tone-dark mx-auto grid max-w-[1680px] gap-16 px-gutter pb-section pt-40 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <BackLink href={`/projects/varketili/${unit.block}/`} />
          <div className="mt-10 flex items-center gap-8">
            <p className="flex items-center gap-3 text-[16px] text-seu-muted">
              <Icon name="block" size={22} className="text-seu-accent-hi" />
              Block <span className="title-m text-[28px] text-seu-fg">{unit.block.slice(1)}</span>
            </p>
            <p className="flex items-center gap-3 text-[16px] text-seu-muted">
              <Icon name="floor" size={22} className="text-seu-accent-hi" />
              Floor <span className="title-m text-[28px] text-seu-fg">{unit.floor}</span>
            </p>
          </div>
          <p className="eyebrow mt-10">SEU Varketili · {statusText[unit.status]}</p>
          <h1 className="page-title mt-4 text-[clamp(40px,4.4vw,76px)]">
            Apartment {unit.number}<span className="text-seu-accent-hi">.</span>
          </h1>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4" data-stagger>
            {(
              [
                ["area", "Total size", `${unit.totalArea} m²`],
                ["living", "Main size", `${unit.livingArea} m²`],
                ["balcony", "Open space", `${unit.openArea} m²`],
                ["bed", "Bedrooms", unit.bedrooms === 0 ? "Studio" : String(unit.bedrooms)],
              ] as [IconName, string, string][]
            ).map(([icon, k, v]) => (
              <div key={k} className="flex flex-col gap-3">
                <dt className="field-label mb-0 flex flex-col gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-seu-line text-seu-accent-hi">
                    <Icon name={icon} size={20} />
                  </span>
                  {k}
                </dt>
                <dd className="title-m -mt-2 normal-case">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Views">
            {unit.views.map((v) => (
              <li key={v} className="tag gap-2 py-1.5">
                <Icon name={viewIcon[v]} size={15} className="text-seu-accent-hi" />
                {viewText[v]}
              </li>
            ))}
          </ul>
          <div className="mt-10 h-px bg-seu-line" />

          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <p className="field-label flex items-center gap-2">
                <Icon name="price" size={15} className="text-seu-accent-hi" /> Price
              </p>
              <p className="title-m text-[clamp(28px,2.4vw,38px)] normal-case">
                ${unit.price.toLocaleString("en-US")}
                <span className="ml-3 text-[15px] text-seu-muted">${unit.pricePerM2}/m²</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAsking(true)}
              className="btn btn-primary btn-lg"
            >
              <Icon name="phone" size={16} /> Request a call
            </button>
          </div>

          <h2 className="eyebrow mt-16">Room by room</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-3" data-stagger>
            {unit.rooms.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-seu-line pb-3">
                <span className="flex items-center gap-2.5 text-seu-muted">
                  <Icon name={roomIcon[r.kind]} size={18} className="text-seu-accent-hi" />
                  {roomText[r.kind]}
                </span>
                <span className="label">{r.area} m²</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-end">
            <a
              href={withBase(`/apartments/${unit.id}/presentation/`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              <Icon name="file" size={16} />
              See presentation <span aria-hidden>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
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
                  className="chip ctl-sm rounded-full px-4"
                >
                  {t}
                </button>
              ))}
            </div>
            <Compass />
            <div className="absolute inset-0 grid place-items-center p-12">
              {tab === "3D" ? (
                <img data-tab-img src={withBase("/images/apartment-3d.webp")} alt={`Apartment ${unit.number}, 3D layout`} className="max-h-full w-[92%] object-contain drop-shadow-[0_30px_40px_rgb(19_33_29/0.25)]" />
              ) : (
                <img
                  data-tab-img
                  src={withBase("/images/apartment-plan.png")}
                  alt={`Apartment ${unit.number}, floor plan`}
                  className={`max-h-full w-[75%] object-contain ${tab === "2D" ? "[filter:sepia(.35)_saturate(1.4)_hue-rotate(-12deg)]" : ""}`}
                />
              )}
            </div>
            {/* The whole floor opens from a centred button, in a bottom sheet. */}
            <div className="vars-light absolute inset-x-0 bottom-5 z-10 flex flex-wrap justify-center gap-3 px-4">
              <button type="button" aria-haspopup="dialog" onClick={() => setSheet(true)} className="btn btn-primary">
                <Icon name="plan" size={18} /> Floor plan
              </button>
              <button type="button" aria-haspopup="dialog" onClick={() => setSun(true)} className="btn bg-white/70 backdrop-blur">
                <Icon name="sun" size={18} /> Sun study
              </button>
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
      <FloorPlanSheet unit={unit} open={sheet} onClose={closeSheet} />
      {sun && <SunStudy variant="sheet" place={`Block ${unit.block.slice(1)}, floor ${unit.floor}`} onClose={closeSun} />}
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
