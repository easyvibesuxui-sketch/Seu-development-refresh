"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withBase } from "@/data/projects";
import { useLang } from "@/lib/useLang";
import { Container, Section } from "@/components/ui/Section";

gsap.registerPlugin(ScrollTrigger);

// One day at home, morning to night. Pictures: Kling lifestyle set (media/life).
const MOMENTS = [
  { image: "/images/life-1.webp", time: "08:00", en: ["Morning on the balcony", "Breakfast in the first sun, with Tbilisi on the horizon."], ka: ["დილა აივანზე", "საუზმე მზის პირველ სხივებთან, თბილისის ხედით."] },
  { image: "/images/life-3.webp", time: "16:00", en: ["Story time", "A book with grandma in the shade of the linden trees."], ka: ["ზღაპრის საათი", "წიგნი ბებიასთან ერთად, ცაცხვის ჩრდილში."] },
  { image: "/images/life-2.webp", time: "17:30", en: ["First rides", "The courtyard has no cars, so children ride freely."], ka: ["პირველი ველოსიპედი", "ეზოში მანქანები არ დადის, ბავშვები თავისუფლად სრიალებენ."] },
  { image: "/images/life-4.webp", time: "18:30", en: ["The playground", "A few steps from the entrance, always in view."], ka: ["საბავშვო მოედანი", "სადარბაზოდან რამდენიმე ნაბიჯში, ყოველთვის თვალწინ."] },
  { image: "/images/life-5.webp", time: "20:00", en: ["Evening walk", "Tree-lined paths, the sunset and the dog leading the way."], ka: ["საღამოს გასეირნება", "ხეივანი, ჩამავალი მზე და ძაღლი, რომელიც ყოველთვის წინ მიდის."] },
  { image: "/images/life-6.webp", time: "21:30", en: ["Dinner on the terrace", "The whole family at one table, under the city lights."], ka: ["ვახშამი ტერასაზე", "მთელი ოჯახი ერთ მაგიდასთან, ქალაქის შუქებით."] },
];

// The ring holds every picture twice, so the drum looks closed while one turn of the page
// shows each moment once.
const SLOTS = MOMENTS.length * 2;
const STEP = 360 / SLOTS;

/*
 * "Joys of every day" as a barrel: the pictures sit around a drum that turns as the page
 * scrolls, the one facing you large and clear, its neighbours curving away into shade. The
 * time and caption of the facing picture change underneath. Reduced motion gets a plain
 * swipeable row instead.
 */
export default function LifeBarrel() {
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const sectionRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStill(true);
    const section = sectionRef.current;
    const ring = ringRef.current;
    if (!section || !ring) return;
    const panels = [...ring.querySelectorAll<HTMLElement>(".barrel-panel")];
    const shades = panels.map((p) => p.querySelector<HTMLElement>(".barrel-shade"));

    // The drum fits the height left between the heading and the caption; the radius follows
    // from the panel width so neighbours meet with a small gap.
    const stage = ring.parentElement!;
    const size = () => {
      stage.style.setProperty("--fit", `${Math.floor(stage.clientHeight * 0.75)}px`);
      const w = panels[0].offsetWidth;
      ring.style.setProperty("--r", `${Math.round(w / 2 / Math.tan(Math.PI / SLOTS) + 14)}px`);
    };
    size();

    const turn = (deg: number) => {
      ring.style.setProperty("--turn", `${deg}deg`);
      panels.forEach((_, i) => {
        // Angle of this panel from the front, folded into -180..180.
        const a = ((((i * STEP + deg) % 360) + 540) % 360) - 180;
        const shade = shades[i];
        if (shade) shade.style.opacity = String(Math.min(0.85, Math.abs(a) / 110));
      });
    };
    turn(0);

    const last = MOMENTS.length - 1;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        const at = self.progress * last;
        turn(-at * STEP);
        setActive(Math.round(at));
      },
    });
    const onResize = () => size();
    window.addEventListener("resize", onResize);
    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const m = MOMENTS[active];

  return (
    <Section tone="light" flush className="relative pb-16 md:pb-28">
      <div ref={sectionRef} className={still ? "" : "h-[420svh]"}>
        <div className={`${still ? "py-section" : "sticky top-0 h-[100svh]"} flex flex-col overflow-hidden`}>
          <Container className="relative z-10 flex flex-wrap items-end justify-between gap-6 pt-32 md:pt-40 [@media(max-height:820px)]:pt-28">
            <div>
              <p className="eyebrow mb-4">{t("Joys of every day", "ყოველდღიური სიხარული")}</p>
              <h2 className="section-title max-w-[16ch] text-[clamp(32px,3.4vw,54px)] lg:max-w-none">
                {t("A happy family, a calm life.", "ბედნიერი ოჯახი, მშვიდი ცხოვრება.")}
              </h2>
            </div>
            <p className="max-w-[36ch] text-[16px] text-seu-muted max-md:hidden">
              {t(
                "One ordinary day in the courtyard — from breakfast on the balcony to dinner under the city lights.",
                "ერთი ჩვეულებრივი დღე ეზოში — აივანზე საუზმიდან ქალაქის შუქებით განათებულ ვახშმამდე.",
              )}
            </p>
          </Container>

          {still ? (
            <ul className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2">
              {MOMENTS.map((x) => (
                <li key={x.time} className="w-[72vw] max-w-[360px] shrink-0 snap-start">
                  <img loading="lazy" decoding="async" src={withBase(x.image)} alt="" className="aspect-[3/4] w-full rounded-[20px] object-cover" />
                  <p className="label mt-4 text-[14px] text-seu-accent-hi">{x.time}</p>
                  <p className="title-m mt-1 text-[20px]">{lang === "ka" ? x.ka[0] : x.en[0]}</p>
                  <p className="mt-1 text-[14px] text-seu-muted">{lang === "ka" ? x.ka[1] : x.en[1]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="barrel-stage relative mt-12 min-h-0 flex-1 md:mt-16 [@media(max-height:820px)]:mt-10" aria-hidden>
                <div ref={ringRef} className="barrel-ring">
                  {Array.from({ length: SLOTS }, (_, i) => {
                    const x = MOMENTS[i % MOMENTS.length];
                    return (
                      <figure key={i} className="barrel-panel" style={{ "--i": i } as React.CSSProperties}>
                        <img loading="lazy" decoding="async" src={withBase(x.image)} alt="" draggable={false} />
                        <span className="barrel-shade" />
                      </figure>
                    );
                  })}
                </div>
              </div>

              <Container className="relative z-10 mt-12 grid grid-cols-1 items-end gap-x-8 gap-y-2 md:grid-cols-[auto_1fr] pb-14 md:mt-16 md:pb-20 [@media(max-height:820px)]:mt-10 [@media(max-height:820px)]:pb-10">
                <p key={`t${active}`} className="barrel-in title-display text-[clamp(40px,6vw,96px)] md:row-span-2 leading-none text-seu-accent-hi tabular-nums">
                  {m.time}
                </p>
                <p key={`h${active}`} className="barrel-in title-m text-[clamp(20px,2vw,28px)]">
                  {lang === "ka" ? m.ka[0] : m.en[0]}
                </p>
                <p key={`p${active}`} className="barrel-in max-w-[44ch] text-[16px] text-seu-muted [animation-delay:80ms]">
                  {lang === "ka" ? m.ka[1] : m.en[1]}
                </p>
              </Container>
              {/* The moments for screen readers, in order. */}
              <ol className="sr-only">
                {MOMENTS.map((x) => (
                  <li key={x.time}>
                    {x.time} — {lang === "ka" ? `${x.ka[0]}. ${x.ka[1]}` : `${x.en[0]}. ${x.en[1]}`}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
