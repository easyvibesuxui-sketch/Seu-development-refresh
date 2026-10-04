"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";

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

export default function ChooseView() {
  const [view, setView] = useState(VIEWS[0]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [discounted, setDiscounted] = useState(false);
  const [hideReserved, setHideReserved] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

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
    <section id="choose-view" className="grid min-h-[100svh] md:grid-cols-[minmax(0,46%)_1fr]">
      <form
        className="flex flex-col justify-center gap-14 px-6 py-32 md:px-12 lg:pr-16"
        onSubmit={(e) => e.preventDefault()}
        data-stagger
      >
        <fieldset>
          <legend className="title-display mb-6 text-[clamp(26px,2.2vw,36px)] uppercase">Choose a view</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view.id === v.id}
                onClick={() => pickView(v)}
                className="label flex h-14 items-center justify-center gap-3 border border-white/25 px-3 text-[13px] tracking-[0.04em] transition-colors duration-300 hover:border-seu-accent-hi aria-pressed:border-seu-accent aria-pressed:bg-seu-accent [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0"
              >
                {v.icon}
                <span className="truncate">{v.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="title-display mb-6 text-[clamp(26px,2.2vw,36px)] uppercase">Rooms</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BEDROOMS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rooms.includes(r)}
                onClick={() => toggleRoom(r)}
                className="label h-14 border border-white/25 text-[13px] tracking-[0.04em] transition-colors duration-300 hover:border-seu-accent-hi aria-pressed:border-seu-cream aria-pressed:bg-seu-cream aria-pressed:text-[#15201d]"
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-4 text-[15px]">
          <Check checked={discounted} onChange={setDiscounted} label="Discounted apartments" />
          <Check checked={hideReserved} onChange={setHideReserved} label="Hide reserved apartments" />
        </div>

        <div>
          <button
            type="submit"
            className="label inline-flex h-14 items-center gap-3 bg-seu-accent px-10 text-[13px] tracking-[0.14em] uppercase transition-colors hover:bg-seu-accent-hi"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.6" />
              <path d="M12.5 12.5L17 17" stroke="#fff" strokeWidth="1.6" />
            </svg>
            Choose apartment
          </button>
        </div>
      </form>

      <div ref={stageRef} className="relative min-h-[60vh] overflow-hidden md:min-h-0">
        <img src={withBase(view.image)} alt={`${view.label} view render`} className="absolute inset-0 h-full w-full object-cover" />
        <img alt="" aria-hidden className="cv-incoming absolute inset-0 h-full w-full object-cover [clip-path:inset(0_0_0_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#15201d]/70 via-transparent to-transparent" />
        <p className="label absolute bottom-10 left-10 text-[12px] tracking-[0.2em] uppercase text-seu-cream/80">
          View · {view.label}
        </p>
      </div>
    </section>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-4">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="grid h-6 w-6 place-items-center rounded border border-white/40 transition-colors peer-checked:border-seu-accent peer-checked:bg-seu-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-seu-accent-hi">
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
            <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}
