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

  return (
    <form
      aria-labelledby={`${id}-title`}
      className={`glass glass-clear ${tone === "dark" ? "glass-dark" : "vars-light"} w-[320px] rounded-[24px] p-6 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ project: "varketili" });
        if (rooms.length) q.set("rooms", [...rooms].sort().join(","));
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(h(`/search/?${q}`));
      }}
    >
      <p id={`${id}-title`} className="eyebrow">
        {t("Find an apartment", "აირჩიე ბინა")}
      </p>

      <fieldset className="mt-6">
        <legend className="field-label">{t("Size, m²", "ზომა, მ²")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="sr-only">{t("From, m²", "დან, მ²")}</span>
            <input className="field" inputMode="numeric" placeholder={t("From", "დან")} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label>
            <span className="sr-only">{t("To, m²", "მდე, მ²")}</span>
            <input className="field" inputMode="numeric" placeholder={t("To", "მდე")} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="field-label">{t("Bedrooms", "საძინებლები")}</legend>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2">
          {ROOMS.map((r) => (
            <button key={r.value} type="button" aria-pressed={rooms.includes(r.value)} onClick={() => toggle(r.value)} className="chip px-0">
              {r.value === 0 ? t("Studio", "სტუდიო") : r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" className="btn btn-primary flex-1">
          {t("Search", "ძებნა")}
        </button>
        <button
          type="button"
          className="btn btn-icon"
          aria-label={t("Reset filters", "ფილტრის გასუფთავება")}
          onClick={() => {
            setFrom("");
            setTo("");
            setRooms([]);
          }}
        >
          <Icon name="reset" size={18} />
        </button>
      </div>
    </form>
  );
}
