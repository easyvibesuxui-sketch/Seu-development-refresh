"use client";

import { useState } from "react";
import { withBase } from "@/data/projects";
import { blockById, unitById, unitsOn, type Unit } from "@/data/inventory";
import { PLAN, PLAN_RATIO, UNIT_SHAPES, centre } from "@/data/floorplan";
import { ROOM, STATUS, UI, VIEW, type Lang } from "@/data/assistant";
import Sheet from "@/components/ui/Sheet";
import Icon, { type IconName } from "@/components/ui/Icon";
import Compass from "@/components/apartment/Compass";

const fill: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

const roomIcon: Record<Unit["rooms"][number]["kind"], IconName> = {
  living: "sofa",
  kitchen: "kitchen",
  bedroom: "bed",
  bathroom: "bath",
  wc: "wc",
  hall: "hall",
  balcony: "balcony",
  storage: "storage",
};


/**
 * The assistant's own floor drawer: the plan of the chosen floor, then an apartment's profile
 * with its PDF and a call request, all without leaving the showroom. Sold flats stay visible but closed.
 */
export default function AssistantFloorDrawer({
  pick,
  lang,
  onClose,
  onUnit,
}: {
  /** The floor to show, and the apartment to open on it straight away (from the chat). */
  pick: { block: string; floor: number; unit?: string } | null;
  lang: Lang;
  onClose: () => void;
  onUnit?: (unit: Unit) => void;
}) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [calling, setCalling] = useState(false);
  const [sent, setSent] = useState(false);
  const [view, setView] = useState<"3D" | "2D" | "plan">("3D");
  const t = (l: { ka: string; en: string }) => l[lang];

  // A new floor starts on its plan, or on the apartment the chat asked for.
  const floorKey = pick ? `${pick.block}-${pick.floor}-${pick.unit ?? ""}` : "";
  const [shownFloor, setShownFloor] = useState(floorKey);
  if (shownFloor !== floorKey) {
    setShownFloor(floorKey);
    setUnit((pick?.unit && unitById(pick.unit)) || null);
    setCalling(false);
    setSent(false);
  }

  if (!pick) return null;
  const block = blockById(pick.block);
  const flats = unitsOn(pick.block, pick.floor);
  const free = flats.filter((u) => u.status === "available").length;
  const blockName = `${t(UI.block)} ${pick.block.slice(1)}`;

  const open = (u: Unit) => {
    setUnit(u);
    setCalling(false);
    setSent(false);
    setView("3D");
    onUnit?.(u);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      side="right"
      eyebrow={`SEU ${lang === "ka" ? "ვარკეთილი" : "Varketili"} · ${blockName}`}
      title={unit ? `${t(UI.apartment)} ${unit.number}` : `${t(UI.floor)} ${pick.floor}`}
      bodyClassName="px-8 pb-10 sm:px-10"
      className="sm:max-w-[640px]"
    >
      {!unit ? (
        <>
          <p className="text-[14px] text-seu-muted">
            {lang === "ka" ? `${flats.length}-დან ${free} თავისუფალი` : `${free} of ${flats.length} available`} · {block?.delivery}
          </p>
          <div className="relative mt-5" style={{ aspectRatio: `${PLAN_RATIO}` }}>
            <img src={withBase(PLAN)} alt={`${t(UI.floorPlan)}: ${blockName}, ${t(UI.floor)} ${pick.floor}`} className="h-full w-full rounded-[14px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {flats.map((u) => (
                <polygon key={u.id} points={UNIT_SHAPES[u.slot].map((p) => p.join(",")).join(" ")} fill={fill[u.status]} fillOpacity={0.22} />
              ))}
            </svg>
            {flats.map((u) => {
              const [cx, cy] = centre(UNIT_SHAPES[u.slot]);
              const style = { left: `${cx}%`, top: `${cy}%` };
              const badge = (
                <span className="label flex items-center gap-1 rounded-full bg-seu-ink/85 px-2.5 py-1 text-[11px] text-white ring-1 ring-white/25">
                  {u.status === "sold" && <Icon name="lock" size={11} />}
                  {u.number}
                </span>
              );
              return u.status === "sold" ? (
                <span key={u.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={style} aria-hidden>
                  {badge}
                </span>
              ) : (
                <button key={u.id} type="button" onClick={() => open(u)} className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110" style={style} aria-label={`${t(UI.apartment)} ${u.number}, ${t(STATUS[u.status])}`}>
                  {badge}
                </button>
              );
            })}
          </div>
          <ul className="mt-4 flex flex-wrap gap-4 text-[12px]">
            {(["available", "reserved", "sold"] as const).map((s) => (
              <li key={s} className="label flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: fill[s] }} />
                {t(STATUS[s])}
              </li>
            ))}
          </ul>

          <h3 className="field-label mt-8">{t(UI.apartments)}</h3>
          <ul className="divide-y divide-seu-line border-y border-seu-line">
            {flats.map((u) => {
              const sold = u.status === "sold";
              const row = (
                <>
                  <span className="title-m w-14 text-[18px]">{u.number}</span>
                  <span className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-[14px] text-seu-muted">
                    <span className="flex items-center gap-1.5">
                      <Icon name="bed" size={15} className="text-seu-accent-hi" /> {u.bedrooms === 0 ? t(UI.studio) : u.bedrooms}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="area" size={15} className="text-seu-accent-hi" /> {u.totalArea} m²
                    </span>
                  </span>
                  <span className="text-right text-[14px]">
                    <span className="flex items-center gap-1.5">
                      {sold ? <Icon name="lock" size={13} /> : <span className="h-2 w-2 rounded-full" style={{ background: fill[u.status] }} />}
                      {t(STATUS[u.status])}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={u.id}>
                  {sold ? (
                    <div className="flex items-center gap-4 py-3 text-seu-muted">{row}</div>
                  ) : (
                    <button type="button" onClick={() => open(u)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-white/5">
                      {row}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-[12px] text-seu-muted">{t(UI.sampleNote)}</p>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setUnit(null)} className="btn btn-sm">
            <Icon name="arrow" size={14} className="rotate-180" /> {t(UI.backToFloor)}
          </button>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-seu-muted">
            <span className="flex items-center gap-2">
              <Icon name="block" size={18} className="text-seu-accent-hi" /> {t(UI.block)} <span className="title-m text-[20px] text-seu-fg">{unit.block.slice(1)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Icon name="floor" size={18} className="text-seu-accent-hi" /> {t(UI.floor)} <span className="title-m text-[20px] text-seu-fg">{unit.floor}</span>
            </span>
            <span className="flex items-center gap-2">
              <Icon name="clock" size={18} className="text-seu-accent-hi" /> {t(UI.delivery)}: <span className="text-seu-fg">{block?.status === "delivered" ? t(UI.delivered) : block?.delivery}</span>
            </span>
          </div>
          <div className="relative mt-5 aspect-[4/3.3] overflow-hidden rounded-[18px] bg-seu-paper">
            <div className="vars-light absolute left-3 top-3 z-10 flex gap-2" role="tablist" aria-label={t(UI.layout)}>
              {(["3D", "2D", "plan"] as const).map((v) => (
                <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className="chip ctl-sm rounded-full px-4">
                  {v === "plan" ? t(UI.planTab) : v}
                </button>
              ))}
            </div>
            <Compass label={t(UI.north)} className="absolute right-3 top-2 z-10" />
            <div className="absolute inset-0 grid place-items-center p-10 pt-14">
              {view === "3D" ? (
                <img src={withBase("/images/apartment-3d.webp")} alt={`${t(UI.apartment)} ${unit.number}, 3D`} className="max-h-full w-[92%] object-contain drop-shadow-[0_24px_30px_rgb(19_33_29/0.25)]" />
              ) : (
                <img
                  src={withBase("/images/apartment-plan.png")}
                  alt={`${t(UI.apartment)} ${unit.number}, ${t(UI.floorPlan)}`}
                  className={`max-h-full w-[75%] object-contain ${view === "2D" ? "[filter:sepia(.35)_saturate(1.4)_hue-rotate(-12deg)]" : ""}`}
                />
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="label flex items-center gap-2 text-[12px] uppercase tracking-[0.14em]">
              <span className="h-2 w-2 rounded-full" style={{ background: fill[unit.status] }} /> {t(STATUS[unit.status])}
            </p>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {(
              [
                ["area", UI.total, `${unit.totalArea} m²`],
                ["living", UI.living, `${unit.livingArea} m²`],
                ["balcony", UI.open, `${unit.openArea} m²`],
                ["bed", UI.bedrooms, unit.bedrooms === 0 ? t(UI.studio) : String(unit.bedrooms)],
              ] as [IconName, { ka: string; en: string }, string][]
            ).map(([icon, k, v]) => (
              <div key={k.en}>
                <dt className="field-label mb-0 flex flex-col gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-seu-line text-seu-accent-hi">
                    <Icon name={icon} size={18} />
                  </span>
                  {t(k)}
                </dt>
                <dd className="title-m mt-1 text-[20px] normal-case">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={t(UI.views)}>
            {unit.views.map((v) => (
              <li key={v} className="tag py-1.5">
                {t(VIEW[v])}
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-seu-line pt-5">
            <div className="flex flex-wrap gap-3">
              {!calling && !sent && (
                <button type="button" onClick={() => setCalling(true)} className="btn btn-primary">
                  <Icon name="phone" size={16} /> {t(UI.send)}
                </button>
              )}
              <a href={withBase(`/assistant/presentation/?id=${unit.id}&lang=${lang}`)} target="_blank" rel="noreferrer" className="btn">
                <Icon name="file" size={16} /> {t(UI.pdf)} <span aria-hidden>↗</span>
                <span className="sr-only">{t(UI.newTab)}</span>
              </a>
            </div>
          </div>
          {calling && !sent && (
            <form
              className="mt-5 grid gap-4 rounded-[16px] border border-seu-line p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label className="block">
                <span className="field-label">{t(UI.name)}</span>
                <input name="name" autoComplete="name" className="field" />
              </label>
              <label className="block">
                <span className="field-label">
                  {t(UI.phone)}
                  <span className="text-seu-accent-hi"> *</span>
                </span>
                <input name="phone" type="tel" required autoComplete="tel" className="field" />
              </label>
              <button type="submit" className="btn btn-primary sm:col-span-2">
                {t(UI.send)}
              </button>
            </form>
          )}
          {sent && (
            <p role="status" className="lead mt-5 text-seu-accent-hi">
              {t(UI.thanks)}
            </p>
          )}
          <h3 className="field-label mt-8">{t(UI.onFloor)}</h3>
          <div className="relative" style={{ aspectRatio: `${PLAN_RATIO}` }}>
            <img src={withBase(PLAN)} alt={`${t(UI.floorPlan)}: ${t(UI.apartment)} ${unit.number}`} className="h-full w-full rounded-[14px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <polygon points={UNIT_SHAPES[unit.slot].map((p) => p.join(",")).join(" ")} fill="#e07a3a" fillOpacity={0.55} stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <h3 className="field-label mt-8">{t(UI.rooms)}</h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
            {unit.rooms.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-seu-line pb-2">
                <span className="flex items-center gap-2 text-seu-muted">
                  <Icon name={roomIcon[r.kind]} size={16} className="text-seu-accent-hi" />
                  {t(ROOM[r.kind])}
                </span>
                <span className="label">{r.area} m²</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] text-seu-muted">{t(UI.sampleNote)}</p>
        </>
      )}
    </Sheet>
  );
}
