"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { units, varketiliBlocks, viewText, type ViewId } from "@/data/inventory";
import ApartmentCard from "@/components/ui/ApartmentCard";
import { Container, Section } from "@/components/ui/Section";
import Select, { type Option } from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";

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

  const projectOptions: Option<string>[] = [
    { value: "", label: "All projects" },
    { value: "varketili", label: "SEU Varketili" },
  ];
  const blockOptions: Option<string>[] = [{ value: "", label: "All blocks" }, ...varketiliBlocks.map((b) => ({ value: b.id, label: b.name }))];
  const viewOptions: Option<ViewId | "">[] = [{ value: "", label: "Any view" }, ...(Object.keys(viewText) as ViewId[]).map((v) => ({ value: v, label: viewText[v] }))];

  return (
    <main>
      <Section tone="light" pattern="right" patternAt={{ x: 0.86, y: 0.3, size: 0.42 }} className="z-10 pb-12 pt-36 md:pt-40">
        <Container>
        <p className="eyebrow mb-6">Search</p>
        <h1 className="page-title" data-split>
          Apartments<span className="text-seu-accent-hi">.</span>
        </h1>
        <h2 className="field-label mt-10 border-b border-seu-line pb-4">Filter apartments</h2>
        {/* One grid, every control on the same 48px line: labels above, controls aligned to the bottom. */}
        <form
          className="mt-8 grid items-end gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <Select label="Project" value={draft.project} options={projectOptions} onChange={(v) => set("project", v)} />
          <Select label="Block" value={draft.block} options={blockOptions} onChange={(v) => set("block", v)} />
          <Select label="View" value={draft.view} options={viewOptions} onChange={(v) => set("view", v)} />
          <fieldset className="min-w-0">
            <legend className="field-label">Size, m²</legend>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" inputMode="numeric" placeholder="From" aria-label="Size from, m²" value={draft.sizeFrom} onChange={(e) => set("sizeFrom", e.target.value.replace(/\D/g, ""))} />
              <input className="field" inputMode="numeric" placeholder="To" aria-label="Size to, m²" value={draft.sizeTo} onChange={(e) => set("sizeTo", e.target.value.replace(/\D/g, ""))} />
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">Bedrooms</legend>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button key={r} type="button" aria-pressed={draft.rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip px-0">
                  {r === 0 ? "Studio" : r === 3 ? "3+" : r}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">Price, {draft.currency}</legend>
            <div className="flex gap-3">
              <input className="field min-w-0 flex-1" inputMode="numeric" placeholder="From" aria-label={`Price from, ${draft.currency}`} value={draft.priceFrom} onChange={(e) => set("priceFrom", e.target.value.replace(/\D/g, ""))} />
              <input className="field min-w-0 flex-1" inputMode="numeric" placeholder="To" aria-label={`Price to, ${draft.currency}`} value={draft.priceTo} onChange={(e) => set("priceTo", e.target.value.replace(/\D/g, ""))} />
              <div className="segmented" role="group" aria-label="Currency">
                {(["USD", "GEL"] as const).map((c) => (
                  <button key={c} type="button" aria-pressed={draft.currency === c} onClick={() => set("currency", c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
          <div>
            <span className="field-label" aria-hidden>
              Availability
            </span>
            <label className="check-row">
              <input type="checkbox" className="check" checked={draft.available} onChange={(e) => set("available", e.target.checked)} />
              Hide sold apartments
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn btn-primary flex-1">
              Search
            </button>
            <button type="button" onClick={clear} className="btn btn-icon" aria-label="Clear filters" title="Clear filters">
              <Icon name="reset" size={18} />
            </button>
          </div>
        </form>
        </Container>
      </Section>

      <Section tone="dark" className="min-h-[60vh] pb-20 pt-12">
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
