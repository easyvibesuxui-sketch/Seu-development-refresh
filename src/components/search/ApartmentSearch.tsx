"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { blockNameIn, units, varketiliBlocks, viewIn, viewText, type ViewId } from "@/data/inventory";
import { useLang } from "@/lib/useLang";
import ApartmentCard from "@/components/ui/ApartmentCard";
import { Container, Section } from "@/components/ui/Section";
import Select, { type Option } from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";

const PAGE = 24;

type Filters = { project: string; block: string; view: ViewId | ""; rooms: number[]; sizeFrom: string; sizeTo: string; available: boolean };

const empty: Filters = { project: "", block: "", view: "", rooms: [], sizeFrom: "", sizeTo: "", available: true };

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
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  const results = useMemo(() => {
    const n = (v: string) => (v.trim() === "" ? null : Number(v));
    return units.filter((u) => {
      if (applied.project && u.project !== applied.project) return false;
      if (applied.block && u.block !== applied.block) return false;
      if (applied.view && !u.views.includes(applied.view)) return false;
      if (applied.rooms.length && !applied.rooms.includes(Math.min(u.bedrooms, 3))) return false;
      if (applied.available && u.status === "sold") return false;
      const sf = n(applied.sizeFrom), st = n(applied.sizeTo);
      if (sf !== null && u.totalArea < sf) return false;
      if (st !== null && u.totalArea > st) return false;
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
    { value: "", label: t("All projects", "ყველა პროექტი") },
    { value: "varketili", label: t("SEU Varketili", "SEU ვარკეთილი") },
  ];
  const blockOptions: Option<string>[] = [{ value: "", label: t("All blocks", "ყველა ბლოკი") }, ...varketiliBlocks.map((b) => ({ value: b.id, label: blockNameIn(b, lang) }))];
  const viewOptions: Option<ViewId | "">[] = [{ value: "", label: t("Any view", "ნებისმიერი ხედი") }, ...(Object.keys(viewText) as ViewId[]).map((v) => ({ value: v, label: viewIn(v, lang) }))];

  return (
    <main>
      <Section tone="light" pattern="right" patternAt={{ x: 0.86, y: 0.3, size: 0.42 }} className="z-10 pb-12 pt-36 md:pt-40">
        <Container>
        <p className="eyebrow mb-6">{t("Search", "ძებნა")}</p>
        <h1 className="page-title" data-split>
          {t("Apartments", "ბინები")}<span className="text-seu-accent-hi">.</span>
        </h1>
        <h2 className="field-label mt-10 border-b border-seu-line pb-4">{t("Filter apartments", "ბინების ფილტრი")}</h2>
        {/* One grid, every control on the same 48px line: labels above, controls aligned to the bottom. */}
        <form
          className="mt-8 grid items-end gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <Select label={t("Project", "პროექტი")} value={draft.project} options={projectOptions} onChange={(v) => set("project", v)} />
          <Select label={t("Block", "ბლოკი")} value={draft.block} options={blockOptions} onChange={(v) => set("block", v)} />
          <Select label={t("View", "ხედი")} value={draft.view} options={viewOptions} onChange={(v) => set("view", v)} />
          <fieldset className="min-w-0">
            <legend className="field-label">{t("Size, m²", "ზომა, მ²")}</legend>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" inputMode="numeric" placeholder={t("From", "დან")} aria-label={t("Size from, m²", "ზომა დან, მ²")} value={draft.sizeFrom} onChange={(e) => set("sizeFrom", e.target.value.replace(/\D/g, ""))} />
              <input className="field" inputMode="numeric" placeholder={t("To", "მდე")} aria-label={t("Size to, m²", "ზომა მდე, მ²")} value={draft.sizeTo} onChange={(e) => set("sizeTo", e.target.value.replace(/\D/g, ""))} />
            </div>
          </fieldset>
          <fieldset className="min-w-0 lg:col-span-2">
            <legend className="field-label">{t("Bedrooms", "საძინებლები")}</legend>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button key={r} type="button" aria-pressed={draft.rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip px-0">
                  {r === 0 ? t("Studio", "სტუდიო") : r === 3 ? "3+" : r}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <span className="field-label" aria-hidden>
              {t("Availability", "ხელმისაწვდომობა")}
            </span>
            <label className="check-row">
              <input type="checkbox" className="check" checked={draft.available} onChange={(e) => set("available", e.target.checked)} />
              {t("Hide sold apartments", "გაყიდული ბინების დამალვა")}
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn btn-primary flex-1">
              {t("Search", "ძებნა")}
            </button>
            <button type="button" onClick={clear} className="btn btn-icon" aria-label={t("Clear filters", "ფილტრის გასუფთავება")} title={t("Clear filters", "ფილტრის გასუფთავება")}>
              <Icon name="reset" size={18} />
            </button>
          </div>
        </form>
        </Container>
      </Section>

      <Section tone="dark" className="min-h-[60vh] pb-20 pt-12">
        <Container>
        <p className="eyebrow mb-10" role="status">
          {results.length} {t("apartments", "ბინა")}
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
                  {t("Show more", "მეტის ნახვა")}
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
            <p className="mt-10 text-[20px] text-seu-muted">{t("Nothing found with these filters", "ფილტრის შესაბამისი ბინა ვერ მოიძებნა")}</p>
            <button type="button" onClick={clear} className="btn btn-primary mt-8">
              {t("Clear filters", "ფილტრის გასუფთავება")}
            </button>
          </div>
        )}
        </Container>
      </Section>
    </main>
  );
}
