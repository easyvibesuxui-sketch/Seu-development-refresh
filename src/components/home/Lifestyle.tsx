"use client";

import { useState } from "react";
import { distanceKm, highlights, projects, withBase } from "@/data/projects";
import AmbientVideo from "@/components/ui/AmbientVideo";
import { Container, Section } from "@/components/ui/Section";

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

  return (
    <Section tone="light" flush className="pb-section">
      {/* Sunlit courtyard film; the heading sits on it and the band melts into the paper below. */}
      <div className="relative grid h-[92svh] min-h-[560px] place-items-center overflow-hidden text-white">
        <div className="absolute inset-0" data-zoom>
          <AmbientVideo name="courtyard-sun" className="h-full w-full object-cover" />
        </div>
        <div className="sunbeams" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(12_22_19/0.7),rgb(12_22_19/0.25)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#f6f1e8]" />
        <div className="relative px-gutter text-center">
          <p className="eyebrow glass glass-dark mx-auto w-max rounded-full py-2 pl-4 pr-5 text-white [--muted:#fff]">
            <span className="text-[#ffd7b5]">05</span>Neighbourhood
          </p>
          <h2 className="mt-8 text-[clamp(40px,5.6vw,96px)] leading-[0.9]" data-split>
            <span className="title-display uppercase" style={{ fontWeight: 600 }}>
              A new way
            </span>{" "}
            <span className="title-display uppercase" style={{ fontWeight: 200 }}>
              of living
            </span>
          </h2>
        </div>
      </div>

      <Container className="mt-24 grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ul className="border-t border-seu-line">
            {TOPICS.map((t, i) => (
              <li key={t.id} className="border-b border-seu-line">
                <button
                  type="button"
                  aria-expanded={t.id === active}
                  aria-controls={`topic-${t.id}`}
                  onClick={() => setActive(t.id)}
                  onMouseEnter={() => setActive(t.id)}
                  className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="label text-[12px] text-seu-accent-hi">{String(i + 1).padStart(2, "0")}</span>
                    <span className="title-m text-seu-muted transition-colors duration-500 group-aria-expanded:text-seu-fg">{t.title}</span>
                  </span>
                  <span className="h-px w-8 bg-current text-seu-muted transition-[width,color] duration-500 group-aria-expanded:w-14 group-aria-expanded:text-seu-accent-hi" />
                </button>
                <div id={`topic-${t.id}`} hidden={t.id !== active} className="body-copy pb-8 pr-10">
                  {t.text}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1.6fr_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] sm:aspect-auto sm:min-h-[620px]">
            {TOPICS.map((t) => (
              <img
                key={t.id}
                src={withBase(t.image)}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                  t.id === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            ))}
          </div>
          <div className="relative hidden overflow-hidden rounded-[24px] sm:mt-24 sm:block">
            {TOPICS.map((t) => (
              <img
                key={t.id}
                src={withBase(t.side)}
                alt=""
                aria-hidden
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${t.id === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
