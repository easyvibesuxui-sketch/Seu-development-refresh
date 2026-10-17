"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { distanceKm, highlights, projects, withBase } from "@/data/projects";
import AmbientVideo from "@/components/ui/AmbientVideo";
import { Container, Section } from "@/components/ui/Section";
import { useLang } from "@/lib/useLang";

const varketili = projects.find((p) => p.id === "varketili");
const near = (id: string, unit = "km") => {
  const h = highlights.find((x) => x.id === id);
  return h && varketili?.coords ? `${distanceKm(varketili.coords, h.coords).toFixed(1)} ${unit}` : "";
};

// Copy comes from the project benefits list on the current SEU site.
const TOPICS = [
  {
    id: "infrastructure",
    title: "Infrastructure",
    ka: [
      "ინფრასტრუქტურა",
      `მეტრო ვარკეთილი ${near("varketili-metro", "კმ")}, Hualing Tbilisi Sea Plaza ${near("hualing-plaza", "კმ")}, East Point ${near("east-point", "კმ")} — მაღაზიები, სკოლები და თბილისის ზღვა აქ ყოველდღიური ცხოვრების ნაწილია.`,
    ],
    text: `Varketili metro ${near("varketili-metro")}, Hualing Tbilisi Sea Plaza ${near("hualing-plaza")}, East Point ${near("east-point")} — shops, schools and the Tbilisi Sea are part of everyday life here.`,
    image: "/images/sun-aerial.jpg",
    side: "/images/sun-balcony.jpg",
  },
  {
    id: "services",
    title: "Services",
    ka: ["სერვისები", "დაცული ეზო, ლობი ყოველი კორპუსის შესასვლელში, მიწისქვეშა და ზედაპირული პარკინგი, სავაჭრო და საოფისე ფართები ადგილზევე."],
    text: "A secure courtyard, a lobby at the entrance of every building, underground and surface parking, and retail and office space on site.",
    image: "/images/sun-lobby.jpg",
    side: "/images/sun-facade.jpg",
  },
  {
    id: "recreation",
    title: "Courtyard & recreation",
    ka: ["ეზო და დასვენება", "2 ჰექტარამდე რეკრეაციული სივრცე საბავშვო და სპორტული მოედნებით, ჩოგბურთის კორტებით, სავარჯიშო დარბაზითა და სკოლით კომპლექსის ტერიტორიაზე."],
    text: "Up to two hectares of recreational space with playgrounds, sports grounds, tennis courts, a gym and a school within the complex.",
    image: "/images/sun-courtyard.jpg",
    side: "/images/varketili-panorama.jpg",
  },
];

gsap.registerPlugin(ScrollTrigger);

// Arch → full screen. Same shape of string at both ends so the clip-path tweens smoothly.
const ARCH = {
  wide: "inset(24% 30% 0% 30% round 50% 50% 0% 0% / 42% 42% 0% 0%)",
  narrow: "inset(22% 10% 0% 10% round 50% 50% 0% 0% / 34% 34% 0% 0%)",
  open: "inset(0% 0% 0% 0% round 0% 0% 0% 0% / 0% 0% 0% 0%)",
};

export default function Lifestyle() {
  const [active, setActive] = useState(TOPICS[0].id);
  const ka = useLang() === "ka";
  const archRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = archRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const from = window.matchMedia("(max-width: 767px)").matches ? ARCH.narrow : ARCH.wide;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 } });
      tl.fromTo(".arch-reveal", { clipPath: from }, { clipPath: ARCH.open, ease: "power2.inOut", duration: 1 })
        .fromTo(".arch-copy", { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.45 }, 0.55);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <Section tone="light" flush className="pb-section">
      {/* Sunlit courtyard film seen through an arch that opens to the full screen as the page
          scrolls (as era.estate opens its architecture); the heading arrives once it is open. */}
      <div ref={archRef} className="relative h-[220svh] motion-reduce:h-auto">
        <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden motion-reduce:relative">
          <div className="arch-reveal absolute inset-0 grid place-items-center text-white">
            <div className="absolute inset-0" data-zoom>
              <AmbientVideo name="courtyard-sun" className="h-full w-full object-cover" />
            </div>
            <div className="sunbeams" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(12_22_19/0.7),rgb(12_22_19/0.25)_70%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#f6f1e8]" />
            <div className="arch-copy relative px-gutter text-center">
              <p className="eyebrow glass glass-dark mx-auto w-max rounded-full py-2 pl-4 pr-5 text-white [--muted:#fff]">
                <span className="text-[#ffd7b5]">05</span>
                {ka ? "სამეზობლო" : "Neighbourhood"}
              </p>
              <h2 className="spread-title mt-8">
                <span className="spread-title__line">{ka ? "ცხოვრების" : "A new way"}</span>
                <span className="spread-title__line text-copper-light">{ka ? "ახალი წესი" : "of living"}</span>
              </h2>
            </div>
          </div>
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
                    <span className="title-m text-seu-muted transition-colors duration-500 group-aria-expanded:text-seu-fg">{ka ? t.ka[0] : t.title}</span>
                  </span>
                  <span className="h-px w-8 bg-current text-seu-muted transition-[width,color] duration-500 group-aria-expanded:w-14 group-aria-expanded:text-seu-accent-hi" />
                </button>
                <div id={`topic-${t.id}`} hidden={t.id !== active} className="body-copy pb-8 pr-10">
                  {ka ? t.ka[1] : t.text}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1.6fr_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] sm:aspect-auto sm:min-h-[620px]">
            {TOPICS.map((t) => (
              <img loading="lazy" decoding="async"
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
              <img loading="lazy" decoding="async"
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
