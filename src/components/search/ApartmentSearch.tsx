"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { units, varketiliBlocks } from "@/data/inventory";
import ApartmentCard from "@/components/ui/ApartmentCard";

const GEL_PER_USD = 2.7; // indicative rate for the price filter
const PAGE = 24;

type Filters = { project: string; block: string; rooms: number[]; sizeFrom: string; sizeTo: string; priceFrom: string; priceTo: string; currency: "USD" | "GEL"; available: boolean };

const empty: Filters = { project: "", block: "", rooms: [], sizeFrom: "", sizeTo: "", priceFrom: "", priceTo: "", currency: "USD", available: true };

export default function ApartmentSearch() {
  const params = useSearchParams();
  const initial = useMemo<Filters>(() => {
    const rooms = params.get("rooms");
    return { ...empty, project: params.get("project") ?? "", rooms: rooms ? [Number(rooms)] : [] };
  }, [params]);
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [shown, setShown] = useState(PAGE);
  const gridRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const k = applied.currency === "GEL" ? GEL_PER_USD : 1;
    const n = (v: string) => (v.trim() === "" ? null : Number(v));
    return units.filter((u) => {
      if (applied.project && u.project !== applied.project) return false;
      if (applied.block && u.block !== applied.block) return false;
      if (applied.rooms.length && !applied.rooms.includes(Math.min(u.bedrooms, 3))) return false;
      if (applied.available && u.status === "sold") return false;
      const sf = n(applied.sizeFrom), st = n(applied.sizeTo), pf = n(applied.priceFrom), pt = n(applied.priceTo);
      if (sf !== null && u.totalArea < sf) return false;
      if (st !== null && u.totalArea > st) return false;
      if (pf !== null && u.price * k < pf) return false;
      if (pt !== null && u.price * k > pt) return false;
      return true;
    });
  }, [applied]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(grid.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.04 });
  }, [results]);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleRoom = (r: number) => set("rooms", draft.rooms.includes(r) ? draft.rooms.filter((x) => x !== r) : [...draft.rooms, r]);
  const search = () => {
    setApplied(draft);
    setShown(PAGE);
  };
  const clear = () => {
    setDraft(empty);
    setApplied(empty);
    setShown(PAGE);
  };

  const field = "h-10 w-full rounded-md border border-[#15201d]/25 bg-white/60 px-3 text-[14px] text-[#15201d] outline-none transition focus:border-seu-accent focus:bg-white";

  return (
    <main>
      <section className="bg-seu-cream px-6 pb-16 pt-40 text-[#15201d] md:px-12">
        <h1 className="title-display text-[clamp(48px,5.6vw,88px)] uppercase leading-none" data-split>
          Apartments.
        </h1>
        <p className="label mt-12 flex items-center gap-3 border-b border-[#15201d]/25 pb-4 text-[12px] uppercase tracking-[0.16em] text-[#15201d]/70">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
            <circle cx="7" cy="7" r="5.5" />
            <path d="M11 11l4 4" />
          </svg>
          Filter apartments
        </p>
        <form
          className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label className="block">
            <span className="label text-[14px]">Project</span>
            <select className={`${field} mt-2`} value={draft.project} onChange={(e) => set("project", e.target.value)}>
              <option value="">All projects</option>
              <option value="varketili">SEU Varketili</option>
            </select>
          </label>
          <label className="block">
            <span className="label text-[14px]">Block</span>
            <select className={`${field} mt-2`} value={draft.block} onChange={(e) => set("block", e.target.value)}>
              <option value="">All blocks</option>
              {varketiliBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="label text-[14px]">Size m²</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input className={field} inputMode="numeric" placeholder="From" aria-label="Size from" value={draft.sizeFrom} onChange={(e) => set("sizeFrom", e.target.value)} />
              <input className={field} inputMode="numeric" placeholder="To" aria-label="Size to" value={draft.sizeTo} onChange={(e) => set("sizeTo", e.target.value)} />
            </div>
          </div>
          <div>
            <span className="label text-[14px]">Bedrooms</span>
            <div className="mt-2 flex gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={draft.rooms.includes(r)}
                  onClick={() => toggleRoom(r)}
                  className="label h-10 min-w-10 rounded-md border border-[#15201d]/30 px-3 text-[14px] transition-colors aria-pressed:border-seu-accent aria-pressed:bg-seu-accent aria-pressed:text-white"
                >
                  {r === 0 ? "Studio" : r === 3 ? "3+" : r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="label text-[14px]">Price</span>
              <div className="flex rounded-md border border-[#15201d]/20 p-0.5 text-[12px]">
                {(["USD", "GEL"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={draft.currency === c}
                    onClick={() => set("currency", c)}
                    className="label rounded px-2.5 py-0.5 transition-colors aria-pressed:bg-seu-accent aria-pressed:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input className={field} inputMode="numeric" placeholder="From" aria-label="Price from" value={draft.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} />
              <input className={field} inputMode="numeric" placeholder="To" aria-label="Price to" value={draft.priceTo} onChange={(e) => set("priceTo", e.target.value)} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 self-end pb-2 text-[14px]">
            <input type="checkbox" checked={draft.available} onChange={(e) => set("available", e.target.checked)} className="h-5 w-5 accent-[#8b5a3c]" />
            Hide sold apartments
          </label>
          <div className="flex items-end gap-6 sm:col-span-2">
            <button type="submit" className="label h-11 rounded-md bg-seu-accent px-10 text-[13px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-seu-accent-hi">
              Search
            </button>
            <button type="button" onClick={clear} className="label h-11 text-[13px] uppercase tracking-[0.12em] hover:text-seu-accent">
              Clear filters
            </button>
          </div>
        </form>
      </section>

      <section className="min-h-[60vh] px-6 py-16 md:px-12">
        <p className="label mb-8 text-[13px] uppercase tracking-[0.14em] text-seu-muted">{results.length} apartments</p>
        {results.length ? (
          <>
            <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, shown).map((u) => (
                <ApartmentCard key={u.id} unit={u} />
              ))}
            </div>
            {shown < results.length && (
              <div className="mt-14 text-center">
                <button
                  type="button"
                  onClick={() => setShown((s) => s + PAGE)}
                  className="label rounded-md border border-white/40 px-10 py-3 text-[13px] uppercase tracking-[0.14em] transition-colors hover:border-seu-accent hover:bg-seu-accent"
                >
                  Show more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid place-items-center py-24 text-center">
            <svg className="empty-search" width="110" height="110" viewBox="0 0 110 110" fill="none" stroke="#a5aca8" strokeWidth="7" aria-hidden>
              <circle cx="46" cy="46" r="36" />
              <path d="M73 73l30 30" strokeLinecap="round" />
              <path d="M34 34l24 24M58 34L34 58" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <p className="mt-10 text-[20px] text-seu-muted">Nothing found with these filters</p>
            <button type="button" onClick={clear} className="label mt-6 text-[13px] uppercase tracking-[0.14em] text-seu-accent-hi hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
