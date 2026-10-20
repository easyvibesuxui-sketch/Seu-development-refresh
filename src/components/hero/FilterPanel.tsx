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
 * Quick apartment finder as one horizontal glass bar, like the search strips on property portals:
 * size and bedrooms are two parts split by a hairline, each a small label over its control so
 * both read on one line, then clear and search. Every value is carried over to the search page.
 * When the bar is narrow the bedrooms take a second row of their own.
 */
export default function FilterPanel({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rooms, setRooms] = useState<number[]>([]);
  const router = useRouter();
  const t = useT();
  const h = useHref();

  const toggle = (n: number) => setRooms((cur) => (cur.includes(n) ? cur.filter((b) => b !== n) : [...cur, n]));
  const part = "flex min-w-0 flex-col justify-center gap-1.5 px-5 py-2";
  const label = "flex items-center gap-2 text-[12px] font-semibold text-seu-muted";
  const input = "field-line w-16 min-w-0 text-[15px] placeholder:text-seu-muted/80";
  const set = !!(from || to || rooms.length);

  return (
    <form
      aria-label={t("Find an apartment", "აირჩიე ბინა")}
      className={`@container glass glass-clear ${tone === "dark" ? "glass-dark" : "vars-light"} rounded-[24px] p-2 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ project: "varketili" });
        if (rooms.length) q.set("rooms", [...rooms].sort().join(","));
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(h(`/search/?${q}`));
      }}
    >
      <div className="flex flex-wrap items-stretch @max-[639px]:gap-y-1">
        <div className={`${part} flex-1`}>
          <span className={label}>
            <Icon name="area" size={15} className="text-seu-accent-hi" />
            {t("Size, m²", "ზომა, მ²")}
          </span>
          <div className="flex h-8 items-center gap-3">
            <input className={input} inputMode="numeric" placeholder={t("from", "დან")} aria-label={t("From, m²", "დან, მ²")} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} />
            <span aria-hidden className="text-seu-muted">–</span>
            <input className={input} inputMode="numeric" placeholder={t("to", "მდე")} aria-label={t("To, m²", "მდე, მ²")} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          </div>
        </div>

        <span aria-hidden className="my-2 w-px bg-[var(--line-strong)] @max-[639px]:hidden" />

        <fieldset className={`${part} flex-1 @max-[639px]:order-last @max-[639px]:basis-full @max-[639px]:border-t @max-[639px]:border-[var(--line)] @max-[639px]:pt-3`}>
          <legend className="sr-only">{t("Bedrooms", "საძინებლები")}</legend>
          <span className={label} aria-hidden>
            <Icon name="bed" size={15} className="text-seu-accent-hi" />
            {t("Bedrooms", "საძინებლები")}
          </span>
          <div className="flex gap-1.5">
            {ROOMS.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={rooms.includes(r.value)}
                onClick={() => toggle(r.value)}
                className={`chip rounded-full text-[13px] tracking-normal [--ctl-h:32px] ${r.value === 0 ? "px-3" : "w-8 px-0"}`}
              >
                {r.value === 0 ? t("Studio", "სტუდიო") : r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="ml-auto flex items-center gap-2 pl-2">
          <span className="tip flex" data-tip={t("Clear", "გასუფთავება")}>
            <button
              type="button"
              disabled={!set}
              aria-label={t("Clear", "გასუფთავება")}
              className="grid h-11 w-11 place-items-center rounded-full text-seu-fg transition-colors hover:bg-[var(--field)] disabled:opacity-35 disabled:hover:bg-transparent"
              onClick={() => {
                setFrom("");
                setTo("");
                setRooms([]);
              }}
            >
              <Icon name="reset" size={18} />
            </button>
          </span>
          <button type="submit" className="btn btn-go h-full min-h-14 rounded-[16px] px-7 text-[13px]">
            <Icon name="search" size={16} strokeWidth={2} />
            {t("Search", "ძებნა")}
          </button>
        </div>
      </div>
    </form>
  );
}
