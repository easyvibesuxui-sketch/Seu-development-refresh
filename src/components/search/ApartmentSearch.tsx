"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { units, varketiliBlocks, viewText, type ViewId } from "@/data/inventory";
import ApartmentCard from "@/components/ui/ApartmentCard";
import { Container, Section } from "@/components/ui/Section";

const GEL_PER_USD = 2.7; // indicative rate for the price filter
const PAGE = 24;

type Filters = { project: string; block: string; view: ViewId | ""; rooms: number[]; sizeFrom: string; sizeTo: string; priceFrom: string; priceTo: string; currency: "USD" | "GEL"; available: boolean };

const empty: Filters = { project: "", block: "", view: "", rooms: [], sizeFrom: "", sizeTo: "", priceFrom: "", priceTo: "", currency: "USD", available: true };

export default function ApartmentSearch() {
  const params = useSearchParams();
  const initial = useMemo<Filters>(() => {
    // Links from the home filters and visual search carry rooms as a list and the size range.
    const rooms = (params.get("rooms") ?? "")
      .split(",")
      .filter(Boolean)
      .map((r) => Math.min(Number(r), 3))
      .filter((r) => !Number.isNaN(r));
    const view = params.get("view") ?? "";
    return { ...empty, project: params.get("project") ?? "", view: view in viewText ? (view as ViewId) : "", rooms, sizeFrom: params.get("from") ?? "", sizeTo: params.get("to") ?? "" };
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
      if (applied.view && !u.views.includes(applied.view)) return false;
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

  const field = "field min-h-12";

  return (
    <main>
      <Section tone="light" className="pb-20 pt-44 md:pt-52">
        <Container>
        <p className="eyebrow mb-8">Search</p>
        <h1 className="page-title" data-split>
          Apartments<span className="text-seu-accent-hi">.</span>
        </h1>
        <h2 className="field-label mt-16 border-b border-seu-line pb-4">Filter apartments</h2>
        <form
          className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label className="block">
            <span className="field-label">Project</span>
            <select className={field} value={draft.project} onChange={(e) => set("project", e.target.value)}>
              <option value="">All projects</option>
              <option value="varketili">SEU Varketili</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Block</span>
            <select className={field} value={draft.block} onChange={(e) => set("block", e.target.value)}>
              <option value="">All blocks</option>
              {varketiliBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">View</span>
            <select className={field} value={draft.view} onChange={(e) => set("view", e.target.value as ViewId | "")}>
              <option value="">Any view</option>
              {(Object.keys(viewText) as ViewId[]).map((v) => (
                <option key={v} value={v}>
                  {viewText[v]}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="field-label">Size m²</span>
            <div className="grid grid-cols-2 gap-3">
              <input className={field} inputMode="numeric" placeholder="From" aria-label="Size from" value={draft.sizeFrom} onChange={(e) => set("sizeFrom", e.target.value)} />
              <input className={field} inputMode="numeric" placeholder="To" aria-label="Size to" value={draft.sizeTo} onChange={(e) => set("sizeTo", e.target.value)} />
            </div>
          </div>
          <div>
            <span className="field-label">Bedrooms</span>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={draft.rooms.includes(r)}
                  onClick={() => toggleRoom(r)}
                  className="chip min-h-12 min-w-12"
                >
                  {r === 0 ? "Studio" : r === 3 ? "3+" : r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="field-label mb-0">Price</span>
              <div className="flex rounded-full border border-seu-line-strong p-1 text-[12px]">
                {(["USD", "GEL"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={draft.currency === c}
                    onClick={() => set("currency", c)}
                    className="label min-h-8 rounded-full px-3 transition-colors aria-pressed:bg-seu-accent aria-pressed:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={field} inputMode="numeric" placeholder="From" aria-label="Price from" value={draft.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} />
              <input className={field} inputMode="numeric" placeholder="To" aria-label="Price to" value={draft.priceTo} onChange={(e) => set("priceTo", e.target.value)} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 self-end pb-2 text-[14px]">
            <input type="checkbox" checked={draft.available} onChange={(e) => set("available", e.target.checked)} className="h-5 w-5 accent-[var(--seu-accent)]" />
            Hide sold apartments
          </label>
          <div className="flex items-end gap-6 sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" onClick={clear} className="btn">
              Clear filters
            </button>
          </div>
        </form>
        </Container>
      </Section>

      <Section tone="dark" className="min-h-[60vh] py-20">
        <Container>
        <p className="eyebrow mb-10" role="status">
          {results.length} apartments
        </p>
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
                  className="btn btn-lg"
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
            <button type="button" onClick={clear} className="btn btn-primary mt-8">
              Clear filters
            </button>
          </div>
        )}
        </Container>
      </Section>
    </main>
  );
}
