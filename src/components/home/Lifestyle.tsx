"use client";

import { useState } from "react";
import { distanceKm, highlights, projects, withBase } from "@/data/projects";
import AmbientVideo from "@/components/ui/AmbientVideo";

const varketili = projects.find((p) => p.id === "varketili");
const near = (id: string) => {
  const h = highlights.find((x) => x.id === id);
  return h && varketili?.coords ? `${distanceKm(varketili.coords, h.coords).toFixed(1)} km` : "";
};

// Copy comes from the project benefits list on the current SEU site.
const TOPICS = [
  {
    id: "infrastructure",
    title: "Infrastructure",
    text: `Varketili metro ${near("varketili-metro")}, Hualing Tbilisi Sea Plaza ${near("hualing-plaza")}, East Point ${near("east-point")} — shops, schools and the Tbilisi Sea are part of everyday life here.`,
    image: "/images/sun-aerial.jpg",
    side: "/images/sun-balcony.jpg",
  },
  {
    id: "services",
    title: "Services",
    text: "A secure courtyard, a lobby at the entrance of every building, underground and surface parking, and retail and office space on site.",
    image: "/images/sun-lobby.jpg",
    side: "/images/sun-facade.jpg",
  },
  {
    id: "recreation",
    title: "Courtyard & recreation",
    text: "Up to two hectares of recreational space with playgrounds, sports grounds, tennis courts, a gym and a school within the complex.",
    image: "/images/sun-courtyard.jpg",
    side: "/images/varketili-panorama.jpg",
  },
];

export default function Lifestyle() {
  const [active, setActive] = useState(TOPICS[0].id);
  const topic = TOPICS.find((t) => t.id === active) ?? TOPICS[0];

  return (
    <section className="pb-48" data-section-out>
      {/* Sunlit courtyard film behind the heading; it melts into the page at both edges. */}
      <div className="relative grid h-[92svh] min-h-[560px] place-items-center overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <AmbientVideo name="courtyard-sun" className="h-full w-full object-cover" />
        </div>
        <div className="sunbeams" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(21_32_29/0.45),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16201d] via-transparent via-30% to-[#16201d]" />
        <h2 className="relative px-6 text-center text-[clamp(44px,7vw,120px)] leading-[0.92]" data-split>
          <span className="title-display uppercase" style={{ fontWeight: 600 }}>
            A new way
          </span>{" "}
          <span className="title-display uppercase" style={{ fontWeight: 200 }}>
            of living
          </span>
        </h2>
      </div>

      <div className="relative -mt-16 grid gap-8 px-6 md:px-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[640px]">
          {TOPICS.map((t) => (
            <img
              key={t.id}
              src={withBase(t.image)}
              alt=""
              aria-hidden={t.id !== active}
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                t.id === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/75 via-transparent to-[#15201d]/40" />
          <p key={topic.id} className="lifestyle-copy absolute left-8 right-8 top-8 max-w-xl text-[17px] leading-relaxed md:left-12 md:top-12">
            {topic.text}
          </p>
        </div>

        <div className="flex flex-col">
          <ul className="border-t border-white/20">
            {TOPICS.map((t) => (
              <li key={t.id} className="border-b border-white/20">
                <button
                  type="button"
                  aria-expanded={t.id === active}
                  onClick={() => setActive(t.id)}
                  onMouseEnter={() => setActive(t.id)}
                  className="title-display group flex w-full items-center justify-between py-6 text-left text-[clamp(22px,2vw,32px)] uppercase text-seu-cream/45 transition-colors duration-500 aria-expanded:text-seu-cream"
                >
                  {t.title}
                  <span className="h-px w-8 bg-current transition-[width] duration-500 group-aria-expanded:w-14 group-aria-expanded:bg-seu-accent-hi" />
                </button>
              </li>
            ))}
          </ul>
          <div className="relative mt-8 min-h-[280px] flex-1 overflow-hidden">
            {TOPICS.map((t) => (
              <img
                key={t.id}
                src={withBase(t.side)}
                alt=""
                aria-hidden
                className={`absolute inset-0 h-full w-full object-cover grayscale transition-[opacity,filter] duration-1000 hover:grayscale-0 ${
                  t.id === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
