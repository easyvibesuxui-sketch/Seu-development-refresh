"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { withBase } from "@/data/projects";
import { viewIn, type ViewId } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import Icon, { type IconName } from "@/components/ui/Icon";

type View = { id: IconName; label: string; image: string };

const VIEWS: View[] = [
  {
    id: "park",
    label: "Hualing Park",
    image: "/images/choose-varketili.jpg",
  },
  {
    id: "city",
    label: "City",
    image: "/images/varketili-panorama.jpg",
  },
  {
    id: "sea",
    label: "Tbilisi Sea",
    image: "/images/upcoming-2.jpg",
  },
  {
    id: "mountains",
    label: "Mountains",
    image: "/images/upcoming-1.jpg",
  },
  {
    id: "courtyard",
    label: "Courtyard",
    image: "/images/finished-vaja.jpg",
  },
  {
    id: "panorama",
    label: "Panorama",
    image: "/images/varketili-panorama.jpg",
  },
];

const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms"];
const BEDROOMS_KA = ["სტუდიო", "1 საძინებელი", "2 საძინებელი", "3 საძინებელი", "4 საძინებელი", "5+ საძინებელი"];

export default function ChooseView() {
  // `view` is the choice (chips, form, phone picture); `shown` is the big picture on wide
  // screens, which catches up once its wipe has finished.
  const [view, setView] = useState(VIEWS[0]);
  const [shown, setShown] = useState(VIEWS[0]);
  const [rooms, setRooms] = useState<string[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const label = (v: View) => viewIn(v.id as ViewId, lang);
  // Chips are narrow: the short Georgian name there, the full one under the picture.
  const chip = (v: View) => (lang === "ka" ? ((({ park: "პარკი", sea: "ზღვა" }) as Record<string, string>)[v.id] ?? label(v)) : label(v));

  const pickView = (next: View) => {
    if (next.id === view.id) return;
    setView(next);
    const stage = stageRef.current;
    // The wide-screen stage is hidden on phones: nothing to animate there.
    if (!stage || stage.offsetParent === null) return setShown(next);
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
          overwrite: true,
          onComplete: () => {
            setShown(next);
            gsap.set(incoming, { clipPath: "inset(0 0 0 100%)" });
          },
        },
      );
    } else setShown(next);
  };

  const toggleRoom = (r: string) => setRooms((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  return (
    <Section id="choose-view" tone="light">
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
            <img loading="lazy" decoding="async" src={withBase(view.image)} alt={t(`${label(view)} view render`, `ხედი: ${label(view)}, რენდერი`)} className="absolute inset-0 h-full w-full object-cover" />
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
              <legend className="field-label mb-4">
                <Icon name="eye" size={14} />
                {t("View", "ხედი")}
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-stagger>
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={view.id === v.id}
                    onClick={() => pickView(v)}
                    className="chip ctl-lg"
                  >
                    <Icon name={v.id} size={18} />
                    <span className="truncate">{chip(v)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="field-label mb-4">
                <Icon name="bed" size={14} />
                {t("Bedrooms", "საძინებლები")}
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-stagger>
                {BEDROOMS.map((r) => (
                  <button key={r} type="button" aria-pressed={rooms.includes(r)} onClick={() => toggleRoom(r)} className="chip ctl-lg">
                    {lang === "ka" ? BEDROOMS_KA[BEDROOMS.indexOf(r)] : r}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <button type="submit" className="btn btn-primary btn-lg max-sm:w-full max-sm:whitespace-normal max-sm:py-3 max-sm:text-center max-sm:leading-snug">
                <Icon name="search" size={18} strokeWidth={2} />
                {t("Show apartments with this view", "ამ ხედის მქონე ბინების ჩვენება")}
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <div ref={stageRef} className="sticky top-28 h-[calc(100svh-9rem)] overflow-hidden rounded-[24px]">
            <img loading="lazy" decoding="async" src={withBase(shown.image)} alt={t(`${label(shown)} view render`, `ხედი: ${label(shown)}, რენდერი`)} className="absolute inset-0 h-full w-full object-cover" />
            <img alt="" aria-hidden className="cv-incoming absolute inset-0 h-full w-full object-cover [clip-path:inset(0_0_0_100%)]" />
            <div className="sunbeams sunbeams--soft" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1613]/70 via-transparent to-transparent" />
            <p className="eyebrow absolute bottom-8 left-8 text-white [--muted:#fff]">{t("View", "ხედი")} · {label(shown)}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
