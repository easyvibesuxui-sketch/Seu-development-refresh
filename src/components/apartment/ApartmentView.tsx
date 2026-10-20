"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { WALL_COLOURS, type TourPlace } from "@/data/tour";
import { roomIn, unitStatusIn, units, viewIn, type RoomKind, type Unit, type ViewId } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import ApartmentCard, { statusClass } from "@/components/ui/ApartmentCard";
import BackLink from "@/components/ui/BackLink";
import RequestCallModal from "@/components/ui/RequestCallModal";
import { Benefits } from "@/components/project/ProjectDetails";
import Icon, { type IconName } from "@/components/ui/Icon";
import SunButton from "@/components/ui/SunButton";
import FloorPlanSheet from "./FloorPlanSheet";
import ApartmentPlan from "./ApartmentPlan";
import Compass from "./Compass";
import VirtualTour, { TourModel } from "./VirtualTour";

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

type Tab = "3D" | "2D" | "Plan" | "Tour";

export default function ApartmentView({ unit }: { unit: Unit }) {
  const [tab, setTab] = useState<Tab>("3D");
  // The tour's room and wall colour live here, so the 3D and 2D markers can open it in a room.
  const [tourAt, setTourAt] = useState<TourPlace>("hall");
  const [wall, setWall] = useState(WALL_COLOURS[0].id);
  const [asking, setAsking] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [sun, setSun] = useState(false);
  const [dims, setDims] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const similar = units
    .filter((u) => u.id !== unit.id && u.bedrooms === unit.bedrooms && u.status !== "sold")
    .sort((a, b) => Math.abs(a.totalArea - unit.totalArea) - Math.abs(b.totalArea - unit.totalArea))
    .slice(0, 8);

  const taken = unit.status !== "available";

  const closeSheet = useCallback(() => setSheet(false), []);
  const closeSun = useCallback(() => setSun(false), []);

  useEffect(() => {
    if (!stageRef.current || tab === "Tour" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(stageRef.current.querySelector("[data-tab-img]"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
  }, [tab]);

  return (
    <main>
      {/* Phones: the title, then the pictures and plan, then the details. Wide screens: the
          details on the left, the pictures on the right. */}
      <section data-tone="dark" className="tone-dark mx-auto grid max-w-[1680px] gap-10 px-gutter pb-section pt-40 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="max-lg:contents">
          <div className="max-lg:order-1">
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
            <p className="eyebrow mt-10">{t("SEU Varketili", "SEU ვარკეთილი")}</p>
            {/* The status sits with the number, in the colours the cards and floor plans use. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <h1 className="page-title text-[clamp(40px,4.4vw,76px)]">
                {t("Apartment", "ბინა")} {unit.number}<span className="text-seu-accent-hi">.</span>
              </h1>
              <span className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[12px] font-semibold uppercase tracking-[0.12em] ${statusClass[unit.status]}`}>
                <span aria-hidden className="h-2 w-2 rounded-full bg-white" />
                {unitStatusIn(unit.status, lang)}
              </span>
            </div>
          </div>
          <div className="max-lg:order-3 lg:mt-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4" data-stagger>
              {(
                [
                  ["area", t("Total size", "საერთო ფართი"), `${unit.totalArea} ${t("m²", "მ²")}`],
                  ["living", t("Main size", "საცხოვრებელი ფართი"), `${unit.livingArea} ${t("m²", "მ²")}`],
                  ["balcony", t("Open space", "საზაფხულო ფართი"), `${unit.openArea} ${t("m²", "მ²")}`],
                  ["bed", t("Bedrooms", "საძინებლები"), unit.bedrooms === 0 ? t("Studio", "სტუდიო") : String(unit.bedrooms)],
                ] as [IconName, string, string][]
              ).map(([icon, k, v]) => (
                // Icon, label and figure share one left edge.
                <div key={k} className="flex flex-col items-start">
                  <dt className="flex flex-col items-start gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-seu-line text-seu-accent-hi">
                      <Icon name={icon} size={20} />
                    </span>
                    {/* Room for two lines, so every figure sits on the same baseline. */}
                    <span className="min-h-[2.8em] text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-seu-muted">{k}</span>
                  </dt>
                  <dd className="title-m normal-case">{v}</dd>
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

            {taken ? (
              // Reserved or sold: say so plainly, then point to what can still be done.
              <div className={`mt-8 rounded-[20px] border p-6 sm:p-8 ${unit.status === "reserved" ? "border-[rgb(15_111_134/0.6)] bg-[rgb(15_111_134/0.14)]" : "border-[rgb(163_23_63/0.6)] bg-[rgb(163_23_63/0.14)]"}`} role="note">
                <p className="title-m flex items-center gap-3 text-[22px]">
                  <Icon name="lock" size={20} className="shrink-0 text-seu-accent-hi" />
                  {unit.status === "reserved" ? t("This apartment is reserved", "ეს ბინა დაჯავშნილია") : t("This apartment is sold", "ეს ბინა გაყიდულია")}
                </p>
                <p className="body-copy mt-3 max-w-[52ch] text-seu-muted">
                  {unit.status === "reserved"
                    ? t(
                        "Someone holds a reservation on it. Ask for a call and we will tell you first if it becomes free, or see apartments of the same size that are open now.",
                        "მასზე ჯავშანი უკვე არსებობს. მოითხოვეთ ზარი და პირველს შეგატყობინებთ, თუ გათავისუფლდება, ან ნახეთ იგივე ზომის თავისუფალი ბინები.",
                      )
                    : t("It has a new owner. Apartments of the same size that are still open are just below.", "ბინას უკვე ახალი მეპატრონე ჰყავს. იგივე ზომის თავისუფალი ბინები ქვემოთაა.")}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {unit.status === "reserved" ? (
                    <>
                      <button type="button" onClick={() => setAsking(true)} data-call className="btn btn-primary">
                        <Icon name="phone" size={16} /> {t("Tell me if it frees up", "შემატყობინეთ")}
                      </button>
                      <a href="#similar" className="inline-flex min-h-11 items-center text-[12px] font-semibold uppercase tracking-[0.12em] underline decoration-current/40 underline-offset-[6px] transition-colors hover:text-seu-accent-hi">
                        {t("Similar apartments", "მსგავსი ბინები")}
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="#similar" className="btn btn-primary">
                        {t("Similar apartments", "მსგავსი ბინები")}
                      </a>
                      <button type="button" onClick={() => setAsking(true)} data-call className="text-[12px] font-semibold uppercase tracking-[0.12em] underline decoration-current/40 underline-offset-[6px] transition-colors hover:text-seu-accent-hi">
                        {t("Request a call", "ზარის მოთხოვნა")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setAsking(true)}
                  data-call
                  className="btn btn-primary btn-lg"
                >
                  <Icon name="phone" size={16} /> {t("Request a call", "ზარის მოთხოვნა")}
                </button>
              </div>
            )}

            <h2 className="eyebrow mt-16">{t("Room by room", "ოთახები")}</h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 text-[16px] min-[480px]:grid-cols-2 lg:grid-cols-3" data-stagger>
              {unit.rooms.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 border-b border-seu-line pb-3">
                  <span className="flex items-center gap-2.5 text-seu-muted">
                    <Icon name={roomIcon[r.kind]} size={18} className="text-seu-accent-hi" />
                    {roomIn(r.kind, lang)}
                  </span>
                  <span className="label shrink-0 whitespace-nowrap">
                    {r.area} {t("m²", "მ²")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-lg:order-2">
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {/* The whole floor opens in a bottom sheet. */}
            <button type="button" aria-haspopup="dialog" onClick={() => setSheet(true)} className="btn btn-sm max-sm:px-3.5">
              <Icon name="plan" size={16} />
              {t("Floor plan", "სართულის გეგმა")}
            </button>
            <a
              href={withBase(h(`/apartments/${unit.id}/presentation/`))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-[12px] font-semibold uppercase tracking-[0.12em] underline decoration-current/40 underline-offset-[6px] transition-colors hover:text-seu-accent-hi"
            >
              <Icon name="file" size={16} />
              <span className="sm:hidden">{t("Presentation", "პრეზენტაცია")}</span>
              <span className="max-sm:hidden">{t("See presentation", "პრეზენტაციის ნახვა")}</span>
              <span className="sr-only">{t("(opens in a new tab)", "(იხსნება ახალ ჩანართში)")}</span>
            </a>
          </div>
          <div ref={stageRef} className="relative mt-4 aspect-[4/3.3] overflow-hidden rounded-[24px] bg-seu-paper max-sm:aspect-[4/5]">
            <div className="vars-light absolute left-4 top-4 z-10 flex gap-2" role="tablist" aria-label={t("Layout view", "განლაგების ხედი")}>
              {(["3D", "2D", "Plan", "Tour"] as Tab[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={tab === v}
                  aria-label={v === "Tour" ? t("Virtual tour", "ვირტუალური ტური") : undefined}
                  onClick={() => setTab(v)}
                  className={`chip ctl-sm rounded-full px-4 ${v === "Tour" && tab !== v ? "bg-white/80 backdrop-blur" : ""}`}
                >
                  {v === "Tour" ? <Icon name="walk" size={15} /> : null}
                  {v === "Plan" ? t("Plan", "გეგმა") : v === "Tour" ? t("Tour", "ტური") : v}
                </button>
              ))}
            </div>
            {tab === "Tour" ? (
              <VirtualTour
                label={t(`Virtual tour of a sample apartment like ${unit.number}`, `ბინის ${unit.number}-ის მსგავსი სანიმუშო ბინის ვირტუალური ტური`)}
                start={tourAt}
                onPlace={setTourAt}
                colour={wall}
                onColour={setWall}
              />
            ) : (
              <>
                <Compass label={t("North arrow", "ჩრდილოეთის ისარი")} className="absolute right-5 top-4 z-10 max-sm:hidden" />
                {tab === "Plan" ? (
                  <div data-tab-img className="absolute inset-x-3 bottom-[76px] top-16 md:inset-x-8">
                    <ApartmentPlan unit={unit} dims={dims} alt={t(`Apartment ${unit.number}, floor plan`, `ბინა ${unit.number}, გეგმა`)} />
                  </div>
                ) : (
                  <TourModel
                    view={tab === "3D" ? "3d" : "2d"}
                    alt={tab === "3D" ? t(`Apartment ${unit.number}, 3D layout`, `ბინა ${unit.number}, 3D განლაგება`) : t(`Apartment ${unit.number}, 2D top view`, `ბინა ${unit.number}, 2D ზედხედი`)}
                    current={tourAt}
                    onPick={(p) => {
                      setTourAt(p);
                      setTab("Tour");
                    }}
                  />
                )}
                {tab === "Plan" && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dims}
                    onClick={() => setDims((d) => !d)}
                    className="plan-switch vars-light absolute bottom-6 left-5 z-10"
                  >
                    <span aria-hidden className="plan-switch__track">
                      <span className="plan-switch__knob" />
                    </span>
                    {t("Dimensions", "ზომები")}
                  </button>
                )}
                <SunButton label={t("Sun study", "მზის კვლევა")} onClick={() => setSun(true)} className="absolute bottom-5 right-5 z-10" />
              </>
            )}
          </div>
          <p className="mt-3 text-[12px] text-seu-muted">{t("Layout images are illustrative for this concept.", "განლაგების სურათები საილუსტრაციოა.")}</p>
        </div>
      </section>

      <Benefits />

      <Section id="similar" tone="light" className="scroll-mt-24 overflow-hidden">
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

