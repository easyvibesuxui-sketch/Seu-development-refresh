"use client";

import Link from "next/link";
import { withBase } from "@/data/projects";
import { unitStatusIn, type Unit } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import Icon from "./Icon";

export const statusClass: Record<Unit["status"], string> = {
  available: "bg-[var(--seu-available)] text-white",
  reserved: "bg-[var(--seu-reserved)] text-white",
  sold: "bg-[var(--seu-sold)] text-white",
};

const dot: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

/**
 * Apartment tile, kept quiet: the cut-out 3D layout with the number and status in one corner chip, a grid of
 * facts as icons (bedrooms, size, block, floor). Sold flats stay visible for context but are
 * not links.
 */
export default function ApartmentCard({ unit, className = "" }: { unit: Unit; className?: string }) {
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const sold = unit.status === "sold";
  const facts: { icon: Parameters<typeof Icon>[0]["name"]; text: string; label: string }[] = [
    { icon: "bed", text: unit.bedrooms === 0 ? t("Studio", "სტუდიო") : t(`${unit.bedrooms} bed`, `${unit.bedrooms} საძ.`), label: t("Bedrooms", "საძინებლები") },
    { icon: "area", text: `${unit.totalArea} ${t("m²", "მ²")}`, label: t("Total size", "საერთო ფართი") },
    { icon: "block", text: `${t("Block", "ბლოკი")} ${unit.block.slice(1)}`, label: t("Block", "ბლოკი") },
    { icon: "floor", text: `${t("Floor", "სართული")} ${unit.floor}`, label: t("Floor", "სართული") },
  ];

  const body = (
    <>
      <div className="relative -mx-2 -mt-2 aspect-[4/3] overflow-hidden rounded-[18px] bg-[radial-gradient(80%_70%_at_50%_45%,rgb(246_241_232/0.08),transparent_70%)]">
        <img
          src={withBase("/tour/dollhouse-cut.webp")}
          alt=""
          loading="lazy"
          // The chip has its own band above the picture, so it never sits on the flat.
          className={`h-full w-full object-contain px-3 pb-2 pt-14 transition-transform duration-700 ${sold ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
        />
        {/* Number and status as one chip in the corner, so the picture leads the card: 12px from
            both edges of the card, concentric with its 24px corner. */}
        <p className="absolute left-0 top-0 inline-flex items-center gap-2.5 rounded-full bg-[#fffcf7]/95 py-1.5 pl-3.5 pr-3 text-[#13211d] shadow-[0_4px_14px_rgb(19_33_29/0.14)] ring-1 ring-[rgb(19_33_29/0.08)] backdrop-blur-md">
          <span className="text-[14px] font-semibold tabular-nums">
            <span className="sr-only">{t("Apartment", "ბინა")} </span>
            {unit.number}
          </span>
          <span aria-hidden className="h-3.5 w-px bg-[rgb(19_33_29/0.18)]" />
          <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#13211d]">
            {sold ? <Icon name="lock" size={12} /> : <span className="h-2 w-2 rounded-full" style={{ background: dot[unit.status] }} />}
            {unitStatusIn(unit.status, lang)}
          </span>
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-seu-line pt-4 text-[14px]">
        {facts.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5">
            <dt className="shrink-0">
              <Icon name={f.icon} size={16} className="text-seu-accent-hi" />
              <span className="sr-only">{f.label}</span>
            </dt>
            <dd className="label whitespace-nowrap">{f.text}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  return sold ? (
    <div aria-label={t(`Apartment ${unit.number}, sold`, `ბინა ${unit.number}, გაყიდული`)} role="group" className={`card is-sold cursor-not-allowed opacity-70 ${className}`}>
      {body}
    </div>
  ) : (
    <Link href={h(`/apartments/${unit.id}/`)} className={`card group ${className}`}>
      {body}
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="tag tag-solid">{children}</span>;
}
