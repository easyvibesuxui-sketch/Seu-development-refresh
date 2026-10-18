"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useHref, useT } from "@/lib/useLang";

// Same buckets as the apartment search: studio, 1, 2 and 3+ bedrooms.
const ROOMS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

/**
 * Quick apartment finder laid out as one horizontal bar on clear glass (size range, bedrooms,
 * clear, search), like the search strips on property portals; every value is carried over to
 * the search page. Below 1280px the bedrooms move to a second line of their own.
 */
export default function FilterPanel({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rooms, setRooms] = useState<number[]>([]);
  const router = useRouter();
  const t = useT();
  const h = useHref();

  const toggle = (n: number) => setRooms((cur) => (cur.includes(n) ? cur.filter((b) => b !== n) : [...cur, n]));
  const field = "flex min-h-14 items-center gap-3 rounded-[16px] border border-[var(--line-strong)] bg-[var(--field)] px-4";
  const label = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-seu-muted";
  const set = !!(from || to || rooms.length);

  return (
    <form
      aria-label={t("Find an apartment", "აირჩიე ბინა")}
      className={`glass glass-clear ${tone === "dark" ? "glass-dark" : "vars-light"} flex flex-wrap items-stretch gap-2 rounded-[24px] p-2 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ project: "varketili" });
        if (rooms.length) q.set("rooms", [...rooms].sort().join(","));
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(h(`/search/?${q}`));
      }}
    >
      {/* Size: one field, "from" and "to" split by a dash. */}
      <div className={`${field} min-w-[220px] flex-1`}>
        <Icon name="area" size={18} className="shrink-0 text-seu-accent-hi" />
        <div className="min-w-0 flex-1">
          <span className={label}>{t("Size, m²", "ზომა, მ²")}</span>
          <div className="mt-0.5 flex items-center gap-2 text-[14px]">
            <input className="w-full min-w-0 bg-transparent outline-none placeholder:text-seu-muted" inputMode="numeric" placeholder={t("from", "დან")} aria-label={t("From, m²", "დან, მ²")} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} />
            <span aria-hidden className="text-seu-muted">–</span>
            <input className="w-full min-w-0 bg-transparent outline-none placeholder:text-seu-muted" inputMode="numeric" placeholder={t("to", "მდე")} aria-label={t("To, m²", "მდე, მ²")} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          </div>
        </div>
      </div>

      <fieldset className={`${field} pr-2 max-[1279px]:order-3 max-[1279px]:w-full`}>
        <legend className="sr-only">{t("Bedrooms", "საძინებლები")}</legend>
        <Icon name="bed" size={18} className="shrink-0 text-seu-accent-hi" />
        <span className={`${label} mr-1`} aria-hidden>
          {t("Bedrooms", "საძინებლები")}
        </span>
        <div className="flex gap-1.5">
          {ROOMS.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={rooms.includes(r.value)}
              onClick={() => toggle(r.value)}
              className={`chip rounded-full text-[13px] tracking-normal [--ctl-h:36px] ${r.value === 0 ? "px-3.5" : "w-9 px-0"}`}
            >
              {r.value === 0 ? t("Studio", "სტუდიო") : r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-stretch gap-2 max-[1279px]:order-2">
        <span className="tip flex" data-tip={t("Clear", "გასუფთავება")}>
          <button
            type="button"
            disabled={!set}
            aria-label={t("Clear", "გასუფთავება")}
            className="grid h-full min-h-14 w-14 place-items-center rounded-[16px] border border-[var(--line-strong)] bg-[var(--field)] text-seu-fg transition-opacity hover:opacity-70 disabled:opacity-40"
            onClick={() => {
              setFrom("");
              setTo("");
              setRooms([]);
            }}
          >
            <Icon name="reset" size={18} />
          </button>
        </span>
        <button type="submit" className="btn btn-copper min-h-14 rounded-[16px] px-7 text-[13px]">
          <Icon name="search" size={16} strokeWidth={2} />
          {t("Search", "ძებნა")}
        </button>
      </div>
    </form>
  );
}
