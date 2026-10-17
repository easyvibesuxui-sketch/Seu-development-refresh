"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { districtIn, nameIn, projects, statusIn } from "@/data/projects";
import { useLang } from "@/lib/useLang";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import AmbientVideo from "@/components/ui/AmbientVideo";
import Icon from "@/components/ui/Icon";

/*
 * The portfolio as one wide film strip, the way ERA shows its interiors: a large card in
 * focus with the next one waiting at the edge. Moving between cards slides the strip while
 * each picture drifts the other way inside its frame, so the change reads as depth rather
 * than a plain swipe. Drag, the arrows, or the keyboard move it; the cursor turns into a
 * "drag" disc over the strip on desktop.
 */
export default function ProjectsShowcase() {
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dx: number; base: number } | null>(null);
  const count = projects.length;

  // Offset that brings card `i` to where the first card rests (the page gutter).
  const offsetOf = (i: number) => {
    const cards = trackRef.current?.children;
    const card = cards?.[i] as HTMLElement | undefined;
    const first = cards?.[0] as HTMLElement | undefined;
    return card && first ? first.offsetLeft - card.offsetLeft : 0;
  };

  const place = (i: number, instant = false) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = instant || reduce ? 0 : 1;
    gsap.to(track, { x: offsetOf(i), duration, ease: "power3.inOut", overwrite: true });
    // Pictures drift against the strip; the focused card is calm, the rest lean away.
    [...track.children].forEach((card, k) => {
      const d = k - i;
      gsap.to(card.querySelector(".show-media"), { xPercent: gsap.utils.clamp(-1, 1, d) * -12, duration, ease: "power3.inOut", overwrite: true });
      gsap.to(card.querySelector(".show-copy"), { opacity: d === 0 ? 1 : 0, y: d === 0 ? 0 : 16, duration: duration * 0.7, delay: d === 0 ? duration * 0.35 : 0, ease: "power2.out", overwrite: true });
      gsap.to(card, { "--dim": d === 0 ? 0 : 0.45, duration, ease: "power2.out", overwrite: true });
    });
  };

  const go = (i: number) => setIndex(Math.max(0, Math.min(count - 1, i)));

  useEffect(() => {
    place(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onResize = () => place(index, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, dx: 0, base: Number(gsap.getProperty(trackRef.current, "x")) || 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const cursor = cursorRef.current;
    const box = viewportRef.current?.getBoundingClientRect();
    if (cursor && box) gsap.to(cursor, { x: e.clientX - box.left, y: e.clientY - box.top, duration: 0.35, ease: "power3.out" });
    if (!drag.current) return;
    drag.current.dx = e.clientX - drag.current.x;
    if (Math.abs(drag.current.dx) > 6) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      gsap.set(trackRef.current, { x: drag.current.base + drag.current.dx * 0.9 });
    }
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.dx < -60) go(index + 1);
    else if (d.dx > 60) go(index - 1);
    else place(index);
  };

  const current = projects[index];

  return (
    <Section id="projects" tone="dark" className="overflow-hidden">
      <Container>
        <SectionHeader
          index="02"
          eyebrow={t("Portfolio", "პორტფოლიო")}
          title={t("Our projects", "ჩვენი პროექტები")}
          spread={[{ text: t("Our", "ჩვენი") }, { text: t("projects.", "პროექტები."), at: "end", accent: true }]}
          intro={t(
            "From finished homes in Saburtalo to the new district rising in Varketili — every project funded from day one and delivered on time.",
            "საბურთალოს დასრულებული სახლებიდან ვარკეთილის ახალ უბნამდე — ყველა პროექტი პირველივე დღიდან დაფინანსებულია და დროულად სრულდება.",
          )}
          action={
            <ButtonLink href="/projects/">
              {t("All projects", "ყველა პროექტი")}
              <Icon name="arrow" size={16} />
            </ButtonLink>
          }
        />
      </Container>

      <div
        ref={viewportRef}
        className="show-viewport relative mt-20 touch-pan-y select-none md:mt-28"
        role="region"
        aria-roledescription={t("carousel", "კარუსელი")}
        aria-label={t("Our projects", "ჩვენი პროექტები")}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => drag.current && onUp()}
      >
        <div ref={trackRef} className="flex gap-4 pl-gutter will-change-transform md:gap-6">
          {projects.map((p, i) => (
            <article
              key={p.id}
              aria-roledescription={t("slide", "სლაიდი")}
              aria-label={`${i + 1} / ${count}: ${nameIn(p, lang)}`}
              aria-hidden={i !== index}
              className="show-card relative h-[min(78svh,760px)] w-[86vw] shrink-0 overflow-hidden rounded-[22px] bg-seu-ink ring-1 ring-white/10 md:w-[68vw] md:rounded-[30px] xl:w-[60vw]"
              onClick={() => i !== index && go(i)}
            >
              <div className="show-media absolute -inset-x-[14%] inset-y-0">
                <AmbientVideo name={`deck-${p.id}`} className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c1613]/70 via-transparent via-40% to-[#0c1613]/90" />
              <div className="pointer-events-none absolute inset-0 bg-[#0c1613] opacity-[var(--dim,0)]" />

              <div className="show-copy relative flex h-full flex-col justify-between p-[clamp(20px,3vw,48px)] pt-[clamp(20px,3vw,40px)]">
                <p className="eyebrow glass glass-dark self-start rounded-full py-2 pl-4 pr-5 text-white [--muted:#fff]">
                  <span className="text-[#ffd7b5]">{String(i + 1).padStart(2, "0")}</span>
                  {statusIn(p.status, lang)} · {p.date}
                </p>
                <div className="grid gap-6">
                  <h3 className="page-title text-[clamp(34px,4.4vw,76px)]">{nameIn(p, lang)}</h3>
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <dl className="flex gap-8 text-[14px]">
                      <div>
                        <dt className="flex items-center gap-1.5 text-white/80">
                          <Icon name="pin" size={14} />
                          {t("Location", "მდებარეობა")}
                        </dt>
                        <dd className="title-m mt-1 normal-case">{districtIn(p.district, lang)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-white/80">
                          <Icon name="area" size={14} />
                          {t("Apartments", "ბინები")}
                        </dt>
                        <dd className="title-m mt-1 normal-case">
                          {p.sizes[0]}–{p.sizes[1]} {t("m²", "მ²")}
                        </dd>
                      </div>
                      <div className="max-sm:hidden">
                        <dt className="flex items-center gap-1.5 text-white/80">
                          <Icon name="floor" size={14} />
                          {t("Floors", "სართული")}
                        </dt>
                        <dd className="title-m mt-1 normal-case">{p.floors}</dd>
                      </div>
                    </dl>
                    <ButtonLink href={`/projects/${p.id}/`} variant={p.status === "ongoing" ? "copper" : "glass"} size="lg" tabIndex={i === index ? 0 : -1}>
                      {t("Explore", "დაათვალიერეთ")} {nameIn(p, lang).replace("SEU ", "")}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </article>
          ))}
          <div aria-hidden className="w-[calc(var(--gutter)-1rem)] shrink-0" />
        </div>

        {/* "Drag" disc that follows the pointer over the strip (mouse only). */}
        <div ref={cursorRef} aria-hidden className="show-cursor pointer-events-none absolute left-0 top-0 z-10 -ml-12 -mt-12 hidden h-24 w-24 place-items-center rounded-full bg-[#fffcf7] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#13211d] md:grid">
          {t("Drag", "გადაათრიე")}
        </div>
      </div>

      <Container className="mt-8 flex items-center gap-6">
        <p className="label shrink-0 text-[14px] tabular-nums" aria-live="polite">
          <span className="text-seu-fg">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-seu-muted"> / {String(count).padStart(2, "0")}</span>
          <span className="sr-only">: {nameIn(current, lang)}</span>
        </p>
        <div className="relative h-px flex-1 bg-white/15" aria-hidden>
          <span className="absolute inset-y-0 left-0 bg-seu-accent-hi transition-[width] duration-700 ease-out" style={{ width: `${((index + 1) / count) * 100}%` }} />
        </div>
        <div className="flex shrink-0 gap-2">
          <span className="tip" data-tip={t("Previous project", "წინა პროექტი")}>
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t("Previous project", "წინა პროექტი")} className="btn btn-icon">
              <Icon name="arrowLeft" size={18} />
            </button>
          </span>
          <span className="tip" data-tip={t("Next project", "შემდეგი პროექტი")}>
            <button type="button" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label={t("Next project", "შემდეგი პროექტი")} className="btn btn-icon">
              <Icon name="arrow" size={18} />
            </button>
          </span>
        </div>
      </Container>
    </Section>
  );
}
