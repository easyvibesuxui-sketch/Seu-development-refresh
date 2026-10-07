"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { roomIn, unitStatusIn, units, viewIn, type RoomKind, type Unit, type ViewId } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import ApartmentCard from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import RequestCallModal from "@/components/ui/RequestCallModal";
import { Benefits } from "@/components/project/ProjectDetails";
import Icon, { type IconName } from "@/components/ui/Icon";
import FloorPlanSheet from "./FloorPlanSheet";
import Compass from "./Compass";

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
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
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
              {t("Block", "ბლოკი")} <span className="title-m text-[28px] text-seu-fg">{unit.block.slice(1)}</span>
            </p>
            <p className="flex items-center gap-3 text-[16px] text-seu-muted">
              <Icon name="floor" size={22} className="text-seu-accent-hi" />
              {t("Floor", "სართული")} <span className="title-m text-[28px] text-seu-fg">{unit.floor}</span>
            </p>
          </div>
          <p className="eyebrow mt-10">
            {t("SEU Varketili", "SEU ვარკეთილი")} · {unitStatusIn(unit.status, lang)}
          </p>
          <h1 className="page-title mt-4 text-[clamp(40px,4.4vw,76px)]">
            {t("Apartment", "ბინა")} {unit.number}<span className="text-seu-accent-hi">.</span>
          </h1>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4" data-stagger>
            {(
              [
                ["area", t("Total size", "საერთო ფართი"), `${unit.totalArea} ${t("m²", "მ²")}`],
                ["living", t("Main size", "საცხოვრებელი ფართი"), `${unit.livingArea} ${t("m²", "მ²")}`],
                ["balcony", t("Open space", "საზაფხულო ფართი"), `${unit.openArea} ${t("m²", "მ²")}`],
                ["bed", t("Bedrooms", "საძინებლები"), unit.bedrooms === 0 ? t("Studio", "სტუდიო") : String(unit.bedrooms)],
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
          <ul className="mt-8 flex flex-wrap gap-2" aria-label={t("Views", "ხედები")}>
            {unit.views.map((v) => (
              <li key={v} className="tag gap-2 py-1.5">
                <Icon name={viewIcon[v]} size={15} className="text-seu-accent-hi" />
                {viewIn(v, lang)}
              </li>
            ))}
          </ul>
          <div className="mt-10 h-px bg-seu-line" />

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setAsking(true)}
              className="btn btn-primary btn-lg"
            >
              <Icon name="phone" size={16} /> {t("Request a call", "ზარის მოთხოვნა")}
            </button>
          </div>

          <h2 className="eyebrow mt-16">{t("Room by room", "ოთახები")}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-3" data-stagger>
            {unit.rooms.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-seu-line pb-3">
                <span className="flex items-center gap-2.5 text-seu-muted">
                  <Icon name={roomIcon[r.kind]} size={18} className="text-seu-accent-hi" />
                  {roomIn(r.kind, lang)}
                </span>
                <span className="label">
                  {r.area} {t("m²", "მ²")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-end">
            <a
              href={withBase(h(`/apartments/${unit.id}/presentation/`))}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              <Icon name="file" size={16} />
              {t("See presentation", "პრეზენტაციის ნახვა")} <span aria-hidden>↗</span>
              <span className="sr-only">{t("(opens in a new tab)", "(იხსნება ახალ ჩანართში)")}</span>
            </a>
          </div>
          <div ref={stageRef} className="relative mt-4 aspect-[4/3.3] overflow-hidden rounded-[24px] bg-seu-paper">
            <div className="vars-light absolute left-4 top-4 z-10 flex gap-2" role="tablist" aria-label={t("Layout view", "განლაგების ხედი")}>
              {(["3D", "2D", "Plan"] as Tab[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={tab === v}
                  onClick={() => setTab(v)}
                  className="chip ctl-sm rounded-full px-4"
                >
                  {v === "Plan" ? t("Plan", "გეგმა") : v}
                </button>
              ))}
            </div>
            <Compass label={t("North arrow", "ჩრდილოეთის ისარი")} />
            <div className="absolute inset-0 grid place-items-center p-12">
              {tab === "3D" ? (
                <img data-tab-img src={withBase("/images/apartment-3d.webp")} alt={t(`Apartment ${unit.number}, 3D layout`, `ბინა ${unit.number}, 3D განლაგება`)} className="max-h-full w-[92%] object-contain drop-shadow-[0_30px_40px_rgb(19_33_29/0.25)]" />
              ) : (
                <img
                  data-tab-img
                  src={withBase("/images/apartment-plan.png")}
                  alt={t(`Apartment ${unit.number}, floor plan`, `ბინა ${unit.number}, გეგმა`)}
                  className={`max-h-full w-[75%] object-contain ${tab === "2D" ? "[filter:sepia(.35)_saturate(1.4)_hue-rotate(-12deg)]" : ""}`}
                />
              )}
            </div>
            {/* The whole floor opens from a centred button, in a bottom sheet. */}
            <div className="vars-light absolute inset-x-0 bottom-5 z-10 flex flex-wrap justify-center gap-3 px-4">
              <button type="button" aria-haspopup="dialog" onClick={() => setSheet(true)} className="btn btn-primary">
                <Icon name="plan" size={18} /> {t("Floor plan", "სართულის გეგმა")}
              </button>
              <button type="button" aria-haspopup="dialog" onClick={() => setSun(true)} className="btn bg-white/70 backdrop-blur">
                <Icon name="sun" size={18} /> {t("Sun study", "მზის კვლევა")}
              </button>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-seu-muted">{t("Layout images are illustrative for this concept.", "განლაგების სურათები საილუსტრაციოა.")}</p>
        </div>
      </section>

      <Benefits />

      <Section tone="light" className="overflow-hidden">
        <Container>
        <SectionHeader eyebrow={t("Same size, other floors", "იგივე ზომა, სხვა სართულები")} title={t("Similar apartments", "მსგავსი ბინები")} />
        </Container>
        <div className="mt-16 flex snap-x scroll-px-gutter gap-6 overflow-x-auto px-gutter pb-6" data-cursor="drag" tabIndex={0} aria-label={t("Similar apartments, scroll horizontally", "მსგავსი ბინები, გადაახვიეთ ჰორიზონტალურად")}>
          {similar.map((u) => (
            <ApartmentCard key={u.id} unit={u} className="w-[300px] shrink-0 snap-start" />
          ))}
        </div>
      </Section>

      <RequestCallModal unit={unit} open={asking} onClose={() => setAsking(false)} />
      <FloorPlanSheet unit={unit} open={sheet} onClose={closeSheet} />
      {sun && <SunStudy variant="sheet" place={t(`Block ${unit.block.slice(1)}, floor ${unit.floor}`, `ბლოკი ${unit.block.slice(1)}, სართული ${unit.floor}`)} onClose={closeSun} />}
    </main>
  );
}

