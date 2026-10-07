"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withBase } from "@/data/projects";
import { useLang } from "@/lib/useLang";

gsap.registerPlugin(ScrollTrigger);

const PANO = "/images/pano-apartment.jpg";
const PANO_ASPECT = 5120 / 1315;
const STRIPS = 48;

// Points of interest at their position across the panorama (0–1 of its width).
const SPOTS = [
  { at: 0.17, label: "Kitchen", note: "Island with travertine top", ka: ["სამზარეულო", "კუნძული ტრავერტინის ზედაპირით"] },
  { at: 0.33, label: "Dining", note: "Table for six by the window", ka: ["სასადილო", "ექვსკაციანი მაგიდა ფანჯარასთან"] },
  { at: 0.52, label: "Living room", note: "Floor-to-ceiling glazing", ka: ["მისაღები", "იატაკიდან ჭერამდე მინა"] },
  { at: 0.9, label: "Balcony", note: "View over the hills", ka: ["აივანი", "ხედი გორაკებზე"] },
];

/*
 * "Step inside": a sunlit apartment wrapped on the inside of a cylinder (48 CSS 3D strips,
 * no WebGL). The view turns with the scroll while the section is pinned, and can be dragged
 * or turned with the arrow keys; hotspots follow their place in the room.
 */
export default function Interior360() {
  const rootRef = useRef<HTMLElement>(null);
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const spotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [geo, setGeo] = useState<{ h: number; w: number; r: number; d: number } | null>(null);
  const angle = useRef({ scroll: 0, drag: 0, shown: 0 });

  // Size the cylinder from the viewport: tall enough to crop floor and ceiling a little.
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const vh = stage.clientHeight;
      const h = Math.round(vh * 1.5);
      const w = h * PANO_ASPECT;
      const r = w / (2 * Math.PI);
      setGeo({ h, w, r, d: (r * vh * 1.02) / h });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene || !geo) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = angle.current;

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (!reduce) a.scroll = self.progress * 200;
      },
    });

    const tick = () => {
      const target = a.scroll + a.drag;
      a.shown += (target - a.shown) * (reduce ? 1 : 0.08);
      scene.style.transform = `translateZ(${geo.d}px) rotateY(${a.shown}deg)`;
      // Hotspots: place each one where its wall faces the viewer, hide when behind.
      SPOTS.forEach((s, i) => {
        const el = spotRefs.current[i];
        if (!el) return;
        let delta = ((s.at * 360 - a.shown + 540) % 360) - 180;
        if (delta > 180) delta -= 360;
        const visible = Math.abs(delta) < 48;
        const x = Math.tan((delta * Math.PI) / 180) * geo.d;
        el.style.transform = `translate3d(${x}px, 0, 0)`;
        el.style.opacity = visible ? String(1 - Math.abs(delta) / 60) : "0";
        el.style.visibility = visible ? "visible" : "hidden";
      });
    };
    gsap.ticker.add(tick);
    return () => {
      st.kill();
      gsap.ticker.remove(tick);
    };
  }, [geo]);

  // Drag (mouse, pen or touch) and arrow keys add to the scroll-driven angle.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const a = angle.current;
    let startX = 0;
    let startDrag = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startDrag = a.drag;
      stage.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (dragging) a.drag = startDrag - (e.clientX - startX) * 0.18;
    };
    const up = () => (dragging = false);
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") a.drag -= 15;
      else if (e.key === "ArrowRight") a.drag += 15;
      else return;
      e.preventDefault();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("keydown", key);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <section ref={rootRef} data-tone="dark" data-no-out className="tone-dark relative h-[260vh]" aria-labelledby="inside-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={stageRef}
          tabIndex={0}
          role="group"
          aria-roledescription={t("360° viewer", "360° ხედი")}
          aria-label={t(
            "360° view of a sample SEU apartment. Use the left and right arrow keys or drag to look around.",
            "SEU-ს სანიმუშო ბინის 360° ხედი. მიმოიხედეთ მარცხენა და მარჯვენა ისრებით ან გადათრევით.",
          )}
          data-cursor="drag"
          className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden bg-seu-ink active:cursor-grabbing"
          style={{ perspective: geo ? `${geo.d}px` : undefined }}
        >
          {geo && (
            <div ref={sceneRef} className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
              {Array.from({ length: STRIPS }, (_, i) => {
                const sw = geo.w / STRIPS;
                return (
                  <div
                    key={i}
                    aria-hidden
                    className="absolute [backface-visibility:hidden]"
                    style={{
                      width: sw + 1.5,
                      height: geo.h,
                      left: -sw / 2,
                      top: -geo.h / 2,
                      backgroundImage: `url(${withBase(PANO)})`,
                      backgroundSize: `${geo.w}px ${geo.h}px`,
                      backgroundPosition: `${-i * sw}px 0`,
                      transform: `rotateY(${-(i + 0.5) * (360 / STRIPS)}deg) translateZ(${-geo.r}px)`,
                    }}
                  />
                );
              })}
            </div>
          )}
          <div className="sunbeams sunbeams--soft" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c1613]/80 via-[#0c1613]/5 via-35% to-[#0c1613]/90" />

          <ul className="pointer-events-none absolute left-1/2 top-[46%]" aria-hidden>
            {SPOTS.map((s, i) => (
              <li
                key={s.label}
                ref={(el) => {
                  spotRefs.current[i] = el;
                }}
                className="absolute -translate-x-1/2 opacity-0"
              >
                <span className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/40 bg-white/10 py-1.5 pl-1.5 pr-4 text-[13px] text-white backdrop-blur-md">
                  <span className="relative grid h-7 w-7 place-items-center rounded-full bg-seu-accent">
                    <span className="absolute inset-0 animate-ping rounded-full bg-seu-accent/50" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <span>
                    <span className="label block uppercase tracking-[0.14em]">{t(s.label, s.ka[0])}</span>
                    <span className="block text-[12px] text-white/75">{t(s.note, s.ka[1])}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1680px] flex-col justify-between px-gutter pb-14 pt-32">
          <p className="eyebrow glass glass-dark self-start rounded-full py-2 pl-4 pr-5 text-white [--muted:#fff]">
            <span className="text-[#ffd7b5]">03</span>{t("Inside", "შიგნით")} · 360°
          </p>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2 id="inside-title" className="section-title" data-split>
              {t("Step inside", "შემობრძანდით")}<span className="text-seu-accent-hi">.</span>
            </h2>
            <p className="label flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-seu-fg/85">
              <svg width="34" height="14" viewBox="0 0 34 14" fill="none" aria-hidden>
                <path d="M6 1L1 7l5 6M28 1l5 6-5 6M1 7h32" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {t("Scroll or drag to look around", "გადაახვიეთ ან გადაათრიეთ მიმოსახედად")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
