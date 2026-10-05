"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

// Same buckets as the apartment search: studio, 1, 2 and 3+ bedrooms.
const ROOMS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

/** Quick apartment finder on glass; every value is carried over to the search page. */
export default function FilterPanel({ className = "" }: { className?: string }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rooms, setRooms] = useState<number[]>([]);
  const router = useRouter();
  const id = useId();

  const toggle = (n: number) => setRooms((cur) => (cur.includes(n) ? cur.filter((b) => b !== n) : [...cur, n]));

  return (
    <form
      aria-labelledby={`${id}-title`}
      className={`w-[320px] rounded-[20px] border border-seu-line bg-[#f6f1e8]/72 p-6 text-seu-fg shadow-[0_20px_60px_rgb(19_33_29/0.12)] backdrop-blur-2xl backdrop-saturate-150 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams({ project: "varketili" });
        if (rooms.length) q.set("rooms", [...rooms].sort().join(","));
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(`/search/?${q}`);
      }}
    >
      <p id={`${id}-title`} className="eyebrow">
        Find an apartment
      </p>

      <fieldset className="mt-6">
        <legend className="field-label">Size, m²</legend>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="sr-only">From, m²</span>
            <input className="field min-h-12" inputMode="numeric" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label>
            <span className="sr-only">To, m²</span>
            <input className="field min-h-12" inputMode="numeric" placeholder="To" value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="field-label">Bedrooms</legend>
        <div className="grid grid-cols-4 gap-2">
          {ROOMS.map((r) => (
            <button key={r.value} type="button" aria-pressed={rooms.includes(r.value)} onClick={() => toggle(r.value)} className="chip min-h-11 px-0">
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" className="btn btn-primary flex-1">
          Search
        </button>
        <button
          type="button"
          className="btn btn-icon"
          aria-label="Reset filters"
          onClick={() => {
            setFrom("");
            setTo("");
            setRooms([]);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M12.5 8a4.5 4.5 0 1 1-1.5-3.4M12 2v3h-3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </form>
  );
}
