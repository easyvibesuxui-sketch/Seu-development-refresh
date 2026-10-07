"use client";

import Link from "next/link";
import { withBase } from "@/data/projects";
import { blockById, blockNameIn, unitStatusIn, unitsOn, type Unit } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { PLAN, PLAN_RATIO, UNIT_SHAPES, centre } from "@/data/floorplan";
import Icon from "@/components/ui/Icon";
import Sheet from "@/components/ui/Sheet";

const fill: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

/**
 * Bottom sheet with the whole floor around a flat: it rises from the bottom edge over a dimmed
 * page, shows this flat lit on the floor plan with its neighbours by status (the other open
 * ones link on), and closes with ✕, Escape, the backdrop or a downward drag of the handle.
 */
export default function FloorPlanSheet({ unit, open, onClose }: { unit: Unit; open: boolean; onClose: () => void }) {
  const block = blockById(unit.block);
  const floor = unitsOn(unit.block, unit.floor);
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const blockName = block ? blockNameIn(block, lang) : "";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={t("Floor plan", "სართულის გეგმა")}
      title={
        <span className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="flex items-center gap-2">
            <Icon name="block" size={22} className="text-seu-accent-hi" /> {blockName}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="floor" size={22} className="text-seu-accent-hi" /> {t("Floor", "სართული")} {unit.floor}
          </span>
        </span>
      }
      bodyClassName="px-gutter pb-10"
    >
        <div className="mx-auto max-w-[1180px]">
          <p className="label mt-0 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">{t("North · Hualing", "ჩრდილოეთი · ჰუალინგი")}</p>
          <div className="relative mt-2" style={{ aspectRatio: `${PLAN_RATIO}` }}>
            <img src={withBase(PLAN)} alt={t(`Plan of floor ${unit.floor}, ${blockName}`, `სართული ${unit.floor}-ის გეგმა, ${blockName}`)} className="h-full w-full rounded-[16px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {floor.map((u) => (
                <polygon
                  key={u.id}
                  points={UNIT_SHAPES[u.slot].map((p) => p.join(",")).join(" ")}
                  fill={u.id === unit.id ? "#e39a62" : fill[u.status]}
                  fillOpacity={u.id === unit.id ? 0.55 : 0.18}
                  stroke={u.id === unit.id ? "#ffd2ad" : "none"}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {floor.map((u) => {
              const [cx, cy] = centre(UNIT_SHAPES[u.slot]);
              const here = u.id === unit.id;
              const badge = (
                <span
                  className={`label flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] shadow-lg ${here ? "bg-seu-accent text-white" : "bg-seu-ink/85 text-white ring-1 ring-white/25"}`}
                >
                  {u.status === "sold" && <Icon name="lock" size={12} />}
                  {u.number}
                  {here && <span className="hidden sm:inline">· {t("this flat", "ეს ბინა")}</span>}
                </span>
              );
              const style = { left: `${cx}%`, top: `${cy}%` };
              return here || u.status === "sold" ? (
                <span key={u.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={style} aria-hidden={!here}>
                  {badge}
                </span>
              ) : (
                <Link
                  key={u.id}
                  href={h(`/apartments/${u.id}/`)}
                  onClick={onClose}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                  style={style}
                  aria-label={`${t("Apartment", "ბინა")} ${u.number}, ${unitStatusIn(u.status, lang)}`}
                >
                  {badge}
                </Link>
              );
            })}
          </div>
          <p className="label mt-2 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">{t("South · Tbilisi Sea", "სამხრეთი · თბილისის ზღვა")}</p>

          <ul className="mt-6 flex flex-wrap justify-center gap-5 text-[12px]">
            <li className="label flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e39a62]" /> {t("This flat", "ეს ბინა")}
            </li>
            {(["available", "reserved", "sold"] as const).map((s) => (
              <li key={s} className="label flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: fill[s] }} />
                {unitStatusIn(s, lang)}
              </li>
            ))}
          </ul>
        </div>
    </Sheet>
  );
}
