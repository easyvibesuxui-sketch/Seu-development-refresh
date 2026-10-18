"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { blockNameIn, units, varketiliBlocks, viewIn, viewText, type ViewId } from "@/data/inventory";
import { useLang } from "@/lib/useLang";
import ApartmentCard from "@/components/ui/ApartmentCard";
import { Container, Section } from "@/components/ui/Section";
import Select, { type Option } from "@/components/ui/Select";
import Sheet from "@/components/ui/Sheet";
import Icon from "@/components/ui/Icon";
import SearchPill, { OptionList } from "./SearchPill";

const PAGE = 24;

type Filters = { project: string; block: string; view: ViewId | ""; rooms: number[]; sizeFrom: string; sizeTo: string; available: boolean };

const empty: Filters = { project: "", block: "", view: "", rooms: [], sizeFrom: "", sizeTo: "", available: true };
const SIZES: [string, string][] = [["", "50"], ["50", "70"], ["70", "90"], ["90", ""]];

/*
 * Apartment search, laid out the way Airbnb does it: one compact search pill (project, block,
 * view, size — each opens its own small panel) above the results, then a sticky row of quick
 * filters (bedrooms, hide sold) with a "Filters" button for everything at once. Every change
 * applies straight away; the pill's round button only takes you down to the results.
 */
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
  const [f, setF] = useState<Filters>(initial);
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  const results = useMemo(() => {
    const n = (v: string) => (v.trim() === "" ? null : Number(v));
    return units.filter((u) => {
      if (f.project && u.project !== f.project) return false;
      if (f.block && u.block !== f.block) return false;
      if (f.view && !u.views.includes(f.view)) return false;
      if (f.rooms.length && !f.rooms.includes(Math.min(u.bedrooms, 3))) return false;
      if (f.available && u.status === "sold") return false;
      const sf = n(f.sizeFrom), st = n(f.sizeTo);
      if (sf !== null && u.totalArea < sf) return false;
      if (st !== null && u.totalArea > st) return false;
      return true;
    });
  }, [f]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 300ms ease-out, the whole stagger kept under 200ms however many cards there are.
    gsap.fromTo(grid.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: { amount: 0.18 } });
  }, [results]);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setF((d) => ({ ...d, [k]: v }));
    setShown(PAGE);
  };
  const toggleRoom = (r: number) => set("rooms", f.rooms.includes(r) ? f.rooms.filter((x) => x !== r) : [...f.rooms, r]);
  const clear = () => {
    setF(empty);
    setShown(PAGE);
  };
  const toResults = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("results")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const projectOptions: Option<string>[] = [
    { value: "", label: t("All projects", "ყველა პროექტი") },
    { value: "varketili", label: t("SEU Varketili", "SEU ვარკეთილი") },
  ];
  const blockOptions: Option<string>[] = [{ value: "", label: t("All blocks", "ყველა ბლოკი") }, ...varketiliBlocks.map((b) => ({ value: b.id, label: blockNameIn(b, lang) }))];
  const viewOptions: Option<ViewId | "">[] = [{ value: "", label: t("Any view", "ნებისმიერი ხედი") }, ...(Object.keys(viewText) as ViewId[]).map((v) => ({ value: v, label: viewIn(v, lang) }))];
  const m2 = t("m²", "მ²");
  const sizeText = (from: string, to: string) =>
    from && to ? `${from}–${to} ${m2}` : from ? t(`From ${from} ${m2}`, `${from} ${m2}-დან`) : to ? t(`Up to ${to} ${m2}`, `${to} ${m2}-მდე`) : t("Any size", "ნებისმიერი");
  const roomText = (r: number) => (r === 0 ? t("Studio", "სტუდიო") : r === 3 ? t("3+ bedrooms", "3+ საძინებელი") : t(`${r} bedroom${r > 1 ? "s" : ""}`, `${r} საძინებელი`));
  const active = [f.project, f.block, f.view, f.sizeFrom || f.sizeTo].filter(Boolean).length + (f.rooms.length ? 1 : 0) + (f.available ? 0 : 1);

  const sizeFields = (
    <div className="grid grid-cols-2 gap-3">
      <label className="grid gap-1.5">
        <span className="text-[12px] font-semibold text-seu-muted">{t("From, m²", "დან, მ²")}</span>
        <input className="field" inputMode="numeric" value={f.sizeFrom} onChange={(e) => set("sizeFrom", e.target.value.replace(/\D/g, ""))} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[12px] font-semibold text-seu-muted">{t("To, m²", "მდე, მ²")}</span>
        <input className="field" inputMode="numeric" value={f.sizeTo} onChange={(e) => set("sizeTo", e.target.value.replace(/\D/g, ""))} />
      </label>
    </div>
  );
  const sizePresets = (
    <div className="mt-3 flex flex-wrap gap-2">
      {SIZES.map(([a, b]) => (
        <button
          key={a + b}
          type="button"
          aria-pressed={f.sizeFrom === a && f.sizeTo === b}
          onClick={() => setF((d) => ({ ...d, sizeFrom: a, sizeTo: b }))}
          className="chip rounded-full px-3.5 [--ctl-h:44px]"
        >
          {sizeText(a, b)}
        </button>
      ))}
    </div>
  );

  return (
    <main>
      <Section tone="light" className="z-10 pb-10 pt-32 md:pb-12 md:pt-36">
        <Container>
          <p className="eyebrow mb-4">{t("Search", "ძებნა")}</p>
          <h1 className="page-title text-[clamp(36px,4.2vw,64px)]" data-split>
            {t("Apartments", "ბინები")}
            <span className="text-seu-accent-hi">.</span>
          </h1>

          {/* Desktop: one pill, a panel per part. */}
          <SearchPill
            className="mt-8 hidden md:flex"
            label={t("Search apartments", "ბინების ძებნა")}
            end={
              <button type="button" onClick={toResults} aria-label={t("Show apartments", "ბინების ჩვენება")} data-tip={t("Show apartments", "ბინების ჩვენება")} className="tip ml-1 grid h-14 w-14 shrink-0 place-items-center self-center rounded-full bg-seu-accent text-white transition-colors hover:bg-seu-accent-hover">
                <Icon name="search" size={20} strokeWidth={2} />
              </button>
            }
            segments={[
              { id: "project", icon: "pin", label: t("Project", "პროექტი"), value: projectOptions.find((o) => o.value === f.project)?.label ?? "", set: !!f.project, panel: (close) => <OptionList options={projectOptions} value={f.project} onPick={(v) => { set("project", v); close(); }} /> },
              { id: "block", icon: "building", label: t("Block", "ბლოკი"), value: blockOptions.find((o) => o.value === f.block)?.label ?? "", set: !!f.block, panel: (close) => <OptionList options={blockOptions} value={f.block} onPick={(v) => { set("block", v); close(); }} /> },
              { id: "view", icon: "eye", label: t("View", "ხედი"), value: viewOptions.find((o) => o.value === f.view)?.label ?? "", set: !!f.view, panel: (close) => <OptionList options={viewOptions} value={f.view} onPick={(v) => { set("view", v); close(); }} /> },
              {
                id: "size",
                icon: "area",
                label: t("Size", "ზომა"),
                value: sizeText(f.sizeFrom, f.sizeTo),
                set: !!(f.sizeFrom || f.sizeTo),
                panel: () => (
                  <div className="w-[300px] p-4">
                    {sizeFields}
                    {sizePresets}
                  </div>
                ),
              },
            ]}
          />

          {/* Phones: the pill is one button that opens every filter. */}
          <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog" className="search-pill mt-6 flex w-full items-center gap-3 p-2 pl-5 text-left md:hidden">
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{t("Search apartments", "ბინების ძებნა")}</span>
              <span className="block truncate text-[12px] text-seu-muted">
                {[projectOptions.find((o) => o.value === f.project)?.label, f.view ? viewIn(f.view, lang) : t("Any view", "ნებისმიერი ხედი"), sizeText(f.sizeFrom, f.sizeTo)].join(" · ")}
              </span>
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-seu-accent text-white">
              <Icon name="search" size={18} strokeWidth={2} />
            </span>
          </button>
        </Container>
      </Section>

      <Section id="results" tone="dark" className="min-h-[60vh] scroll-mt-20 pb-20 pt-0">
        {/* Quick filters stay at hand while scrolling the results. */}
        <div className="sticky top-[84px] z-20 border-b border-seu-line bg-seu-bg/90 backdrop-blur-xl">
          <Container className="flex items-center gap-3 py-3">
            <p className="label shrink-0 text-[14px]" role="status">
              {results.length} {t(results.length === 1 ? "apartment" : "apartments", "ბინა")}
            </p>
            <div className="no-scrollbar -my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" role="group" aria-label={t("Quick filters", "სწრაფი ფილტრები")}>
              {[0, 1, 2, 3].map((r) => (
                <button key={r} type="button" aria-pressed={f.rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip shrink-0 rounded-full px-4 [--ctl-h:44px]">
                  {roomText(r)}
                </button>
              ))}
              <button type="button" aria-pressed={f.available} onClick={() => set("available", !f.available)} className="chip shrink-0 gap-2 rounded-full px-4 [--ctl-h:44px]">
                <Icon name="eyeOff" size={16} />
                {t("Hide sold", "გაყიდულის დამალვა")}
              </button>
            </div>
            <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog" data-tip={t("Filters", "ფილტრები")} className="chip tip sm:after:hidden relative shrink-0 rounded-full px-4 [--ctl-h:44px] md:hidden">
              <Icon name="filters" size={16} />
              <span className="max-sm:sr-only">{t("Filters", "ფილტრები")}</span>
              {active > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-seu-accent px-1 text-[12px] text-white">
                  {active}
                  <span className="sr-only">{t(" active", " აქტიური")}</span>
                </span>
              )}
            </button>
          </Container>
        </div>

        <Container className="pt-10">
          {results.length ? (
            <>
              <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.slice(0, shown).map((u) => (
                  <ApartmentCard key={u.id} unit={u} />
                ))}
              </div>
              {shown < results.length && (
                <div className="mt-14 text-center">
                  <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn btn-lg">
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
              <h2 className="title-m mt-10 text-[clamp(20px,2vw,26px)]">{t("No apartments match these filters", "ამ ფილტრებით ბინა ვერ მოიძებნა")}</h2>
              <p className="mt-3 max-w-[44ch] text-[16px] text-seu-muted">
                {t("Try a wider size range, another view, or show sold apartments too.", "სცადეთ უფრო ფართო ზომა, სხვა ხედი ან გაყიდული ბინების ჩვენებაც.")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clear} className="btn btn-primary">
                  {t("Clear filters", "ფილტრების გასუფთავება")}
                </button>
                <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog" className="btn">
                  {t("Edit filters", "ფილტრების შეცვლა")}
                </button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Every filter at once (and the whole search on phones). */}
      <Sheet open={sheet} onClose={() => setSheet(false)} side="right" tone="light" title={t("Filters", "ფილტრები")} bodyClassName="flex flex-col px-8 pb-0 sm:px-10">
        <div className="grid gap-8">
          <Select icon="pin" label={t("Project", "პროექტი")} value={f.project} options={projectOptions} onChange={(v) => set("project", v)} />
          <Select icon="building" label={t("Block", "ბლოკი")} value={f.block} options={blockOptions} onChange={(v) => set("block", v)} />
          <Select icon="eye" label={t("View", "ხედი")} value={f.view} options={viewOptions} onChange={(v) => set("view", v)} />
          <fieldset className="min-w-0">
            <legend className="field-label">
              <Icon name="area" size={14} />
              {t("Size, m²", "ზომა, მ²")}
            </legend>
            {sizeFields}
            {sizePresets}
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">
              <Icon name="bed" size={14} />
              {t("Bedrooms", "საძინებლები")}
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button key={r} type="button" aria-pressed={f.rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip px-0">
                  {r === 0 ? t("Studio", "სტუდიო") : r === 3 ? "3+" : r}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="check-row">
            <input type="checkbox" className="check" checked={f.available} onChange={(e) => set("available", e.target.checked)} />
            {t("Hide sold apartments", "გაყიდული ბინების დამალვა")}
          </label>
        </div>
        <div className="sticky bottom-0 -mx-8 mt-10 flex items-center justify-between gap-4 border-t border-seu-line bg-[var(--popover)] px-8 py-4 sm:-mx-10 sm:px-10">
          <button type="button" onClick={clear} className="label min-h-11 text-[14px] underline underline-offset-4">
            {t("Clear all", "გასუფთავება")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSheet(false);
              toResults();
            }}
            className="btn btn-primary"
          >
            {t(`Show ${results.length} apartments`, `${results.length} ბინის ჩვენება`)}
          </button>
        </div>
      </Sheet>
    </main>
  );
}
