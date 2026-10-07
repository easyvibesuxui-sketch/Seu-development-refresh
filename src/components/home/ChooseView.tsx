"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { withBase } from "@/data/projects";
import { viewIn, type ViewId } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

type View = { id: string; label: string; image: string; icon: React.ReactNode };

const stroke = { stroke: "currentColor", strokeWidth: 1.3, fill: "none" } as const;

const VIEWS: View[] = [
  {
    id: "park",
    label: "Hualing Park",
    image: "/images/choose-varketili.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7zM12 16v5" />
      </svg>
    ),
  },
  {
    id: "city",
    label: "City",
    image: "/images/varketili-panorama.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M3 21V9h5v12M8 21V4h7v17M15 21v-9h6v9M2 21h20M10 7h3M10 10h3M10 13h3" />
      </svg>
    ),
  },
  {
    id: "sea",
    label: "Tbilisi Sea",
    image: "/images/upcoming-2.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M16 8a3 3 0 1 0-6 0" />
      </svg>
    ),
  },
  {
    id: "mountains",
    label: "Mountains",
    image: "/images/upcoming-1.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M2 20l7-12 4 6 3-4 6 10H2z" />
      </svg>
    ),
  },
  {
    id: "courtyard",
    label: "Courtyard",
    image: "/images/finished-vaja.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M3 20h18M5 20v-6h14v6M8 14V9M16 14V9M6 9h4M14 9h4M12 4v10" />
      </svg>
    ),
  },
  {
    id: "panorama",
    label: "Panorama",
    image: "/images/varketili-panorama.jpg",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M2 6c6 2 14 2 20 0v12c-6-2-14-2-20 0V6z" />
        <path d="M5 15l4-4 3 3 2-2 4 4" />
      </svg>
    ),
  },
];

const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms"];
const BEDROOMS_KA = ["სტუდიო", "1 საძინებელი", "2 საძინებელი", "3 საძინებელი", "4 საძინებელი", "5+ საძინებელი"];

export default function ChooseView() {
  const [view, setView] = useState(VIEWS[0]);
  const [rooms, setRooms] = useState<string[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const label = (v: View) => viewIn(v.id as ViewId, lang);
  // Chips are narrow: the short Georgian name there, the full one under the picture.
  const chip = (v: View) => (lang === "ka" ? ({ park: "პარკი", sea: "ზღვა" }[v.id] ?? label(v)) : label(v));

  const pickView = (next: View) => {
    if (next.id === view.id) return;
    const stage = stageRef.current;
    if (!stage) return setView(next);
    // New image wipes in over the current one, then becomes the base layer.
    const incoming = stage.querySelector<HTMLImageElement>(".cv-incoming");
    if (incoming) {
      incoming.src = withBase(next.image);
      gsap.fromTo(
        incoming,
        { clipPath: "inset(0 0 0 100%)", scale: 1.08 },
        {
          clipPath: "inset(0 0 0 0%)",
          scale: 1,
          duration: 1.1,
          ease: "expo.inOut",
          onComplete: () => {
            setView(next);
            gsap.set(incoming, { clipPath: "inset(0 0 0 100%)" });
          },
        },
      );
    } else setView(next);
  };

  const toggleRoom = (r: string) => setRooms((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  return (
    <Section id="choose-view" tone="light" data-no-out>
      <Container className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
        <div>
          <SectionHeader index="04" eyebrow={t("Find yours", "იპოვეთ თქვენი")} title={t("Choose a view", "აირჩიეთ ხედი")} className="lg:grid-cols-1" />
          <p className="lead mt-10 max-w-[44ch] text-seu-muted">
            {t(
              "Start from what you want to see every morning — the park, the city or the Tbilisi Sea — then pick the size.",
              "დაიწყეთ იმით, რისი დანახვაც ყოველ დილით გსურთ — პარკი, ქალაქი თუ თბილისის ზღვა — შემდეგ კი ზომა აირჩიეთ.",
            )}
          </p>

          {/* On phones the picture sits above the controls; on wide screens it stays pinned beside them. */}
          <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-[20px] lg:hidden">
            <img src={withBase(view.image)} alt={t(`${label(view)} view render`, `ხედი: ${label(view)}, რენდერი`)} className="absolute inset-0 h-full w-full object-cover" />
          </div>

          <form
            className="mt-14 flex flex-col gap-12"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new URLSearchParams({ project: "varketili", view: view.id });
              const picked = rooms.map((r) => Math.min(BEDROOMS.indexOf(r), 3));
              if (picked.length) q.set("rooms", [...new Set(picked)].sort().join(","));
              router.push(h(`/search/?${q}`));
            }}
          >
            <fieldset>
              <legend className="field-label mb-4">{t("View", "ხედი")}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-stagger>
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={view.id === v.id}
                    onClick={() => pickView(v)}
                    className="chip ctl-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0"
                  >
                    {v.icon}
                    <span className="truncate">{chip(v)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="field-label mb-4">{t("Bedrooms", "საძინებლები")}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-stagger>
                {BEDROOMS.map((r) => (
                  <button key={r} type="button" aria-pressed={rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip ctl-lg">
                    {lang === "ka" ? BEDROOMS_KA[BEDROOMS.indexOf(r)] : r}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <button type="submit" className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {t("Show apartments with this view", "ამ ხედის მქონე ბინების ჩვენება")}
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <div ref={stageRef} className="sticky top-28 h-[calc(100svh-9rem)] overflow-hidden rounded-[24px]">
            <img src={withBase(view.image)} alt={t(`${label(view)} view render`, `ხედი: ${label(view)}, რენდერი`)} className="absolute inset-0 h-full w-full object-cover" />
            <img alt="" aria-hidden className="cv-incoming absolute inset-0 h-full w-full object-cover [clip-path:inset(0_0_0_100%)]" />
            <div className="sunbeams sunbeams--soft" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1613]/70 via-transparent to-transparent" />
            <p className="eyebrow absolute bottom-8 left-8 text-white [--muted:#fff]">{t("View", "ხედი")} · {label(view)}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
