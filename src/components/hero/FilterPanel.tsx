"use client";

import { useId, useState } from "react";
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
 * Quick apartment finder on clear glass; every value is carried over to the search page.
 * Sized after era.estate's visual-selection panel: small caps labels, one rounded field per
 * range, round room toggles and plenty of air between the groups.
 * `tone` matches the scene behind it: light over the daytime map, dark over a shaded render.
 */
export default function FilterPanel({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rooms, setRooms] = useState<number[]>([]);
  const router = useRouter();
  const id = useId();
  const t = useT();
  const h = useHref();

  const toggle = (n: number) => setRooms((cur) => (cur.includes(n) ? cur.filter((b) => b !== n) : [...cur, n]));
  const label = "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-seu-accent-hi";

  return (
    <form
      aria-labelledby={`${id}-title`}
      className={`glass glass-clear ${tone === "dark" ? "glass-dark" : "vars-light"} w-[300px] rounded-[24px] p-7 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ project: "varketili" });
        if (rooms.length) q.set("rooms", [...rooms].sort().join(","));
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(h(`/search/?${q}`));
      }}
    >
      <p id={`${id}-title`} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-seu-fg">
        {t("Find an apartment", "აირჩიე ბინა")}
      </p>

      <fieldset className="mt-7">
        <legend className={label}>
          <Icon name="area" size={13} />
          {t("Size, m²", "ზომა, მ²")}
        </legend>
        {/* One field for the range: "from" and "to" share a pill, split by a hairline. */}
        <div className="mt-3 grid h-11 grid-cols-2 rounded-full border border-[var(--line-strong)] bg-[var(--field)] transition-colors focus-within:border-seu-fg">
          <label className="flex min-w-0 items-center gap-2 pl-4 pr-2">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-seu-muted">{t("From", "დან")}</span>
            <input className="w-full min-w-0 bg-transparent text-[14px] outline-none" inputMode="numeric" aria-label={t("From, m²", "დან, მ²")} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="flex min-w-0 items-center gap-2 border-l border-[var(--line)] pl-4 pr-2">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-seu-muted">{t("To", "მდე")}</span>
            <input className="w-full min-w-0 bg-transparent text-[14px] outline-none" inputMode="numeric" aria-label={t("To, m²", "მდე, მ²")} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className={label}>
          <Icon name="bed" size={13} />
          {t("Bedrooms", "საძინებლები")}
        </legend>
        <div className="mt-3 flex gap-2">
          {ROOMS.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={rooms.includes(r.value)}
              onClick={() => toggle(r.value)}
              className={`chip rounded-full text-[13px] tracking-normal [--ctl-h:40px] ${r.value === 0 ? "px-4" : "w-10 px-0"}`}
            >
              {r.value === 0 ? t("Studio", "სტუდიო") : r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-seu-fg transition-opacity hover:opacity-70"
          onClick={() => {
            setFrom("");
            setTo("");
            setRooms([]);
          }}
        >
          <Icon name="reset" size={15} />
          {t("Reset", "გასუფთავება")}
        </button>
        <button type="submit" className="btn btn-copper px-6 text-[13px] [--ctl-h:44px]">
          <Icon name="search" size={15} strokeWidth={2} />
          {t("Search", "ძებნა")}
        </button>
      </div>
    </form>
  );
}
