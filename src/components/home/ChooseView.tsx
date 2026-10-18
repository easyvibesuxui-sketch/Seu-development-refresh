"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withBase } from "@/data/projects";
import { viewIn, type ViewId } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import Icon, { type IconName } from "@/components/ui/Icon";

// Each view is shown as it looks from a window (Kling, golden hour).
const VIEWS: (ViewId & IconName)[] = ["park", "city", "sea", "mountains", "courtyard", "panorama"];

const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms"];
const BEDROOMS_KA = ["სტუდიო", "1 საძინებელი", "2 საძინებელი", "3 საძინებელი", "4 საძინებელი", "5+ საძინებელი"];

/*
 * Choose a view: one large picture card per view (what you would see from the window),
 * then the number of bedrooms as a light row of pills, then one button to the results.
 */
export default function ChooseView() {
  const [view, setView] = useState<ViewId>(VIEWS[0]);
  const [rooms, setRooms] = useState<string[]>([]);
  const router = useRouter();
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  const toggleRoom = (r: string) => setRooms((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  return (
    <Section id="choose-view" tone="light">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-24">
          <SectionHeader index="04" eyebrow={t("Find yours", "იპოვეთ თქვენი")} title={t("Choose a view", "აირჩიეთ ხედი")} spread={[{ text: t("Choose", "აირჩიეთ") }, { text: t("a view.", "ხედი."), at: "end", accent: true }]} />
          <p className="lead max-w-[44ch] text-seu-muted">
            {t(
              "Start from what you want to see every morning — the park, the city or the Tbilisi Sea — then pick the size.",
              "დაიწყეთ იმით, რისი დანახვაც ყოველ დილით გსურთ — პარკი, ქალაქი თუ თბილისის ზღვა — შემდეგ კი ზომა აირჩიეთ.",
            )}
          </p>
        </div>

        <form
          className="mt-12 md:mt-16"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new URLSearchParams({ project: "varketili", view });
            const picked = rooms.map((r) => Math.min(BEDROOMS.indexOf(r), 3));
            if (picked.length) q.set("rooms", [...new Set(picked)].sort().join(","));
            router.push(h(`/search/?${q}`));
          }}
        >
          <fieldset>
            <legend className="sr-only">{t("View", "ხედი")}</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6" data-stagger>
              {VIEWS.map((v) => {
                const on = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setView(v)}
                    className={`view-card group relative aspect-[4/3] overflow-hidden rounded-[18px] text-left outline-offset-4 xl:aspect-[3/4] ${on ? "is-on" : ""}`}
                  >
                    <img loading="lazy" decoding="async" src={withBase(`/images/view-${v}.webp`)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0c1613]/75 via-[#0c1613]/10 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white md:p-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur">
                        <Icon name={v} size={16} />
                      </span>
                      <span className="min-w-0 text-[13px] font-semibold leading-tight md:text-[15px]">{viewIn(v, lang)}</span>
                    </span>
                    {/* Every card shows a selection circle; the chosen one fills with a check and gets a frame. */}
                    <span aria-hidden className="view-card__check absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full shadow-[0_4px_14px_rgb(0_0_0/0.2)]">
                      <Icon name="check" size={15} strokeWidth={2.2} />
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-10 flex flex-col gap-8 md:mt-12 lg:flex-row lg:items-end lg:justify-between">
            <fieldset className="min-w-0">
              <legend className="field-label mb-4">
                <Icon name="bed" size={14} />
                {t("Bedrooms", "საძინებლები")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {BEDROOMS.map((r, i) => (
                  <button key={r} type="button" aria-pressed={rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip rounded-full px-5 [--ctl-h:44px]">
                    {lang === "ka" ? BEDROOMS_KA[i] : r}
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-copper btn-lg shrink-0 max-sm:w-full max-sm:whitespace-normal max-sm:py-3 max-sm:text-center max-sm:leading-snug">
              <Icon name="search" size={18} strokeWidth={2} />
              {t("Show apartments with this view", "ამ ხედის მქონე ბინების ჩვენება")}
            </button>
          </div>
        </form>
      </Container>
    </Section>
  );
}
