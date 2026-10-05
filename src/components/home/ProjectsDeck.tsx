"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, statusLabel } from "@/data/projects";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import AmbientVideo from "@/components/ui/AmbientVideo";

gsap.registerPlugin(ScrollTrigger);

/*
 * The portfolio as a deck of full-screen cards. Each card is sticky, so the next one slides
 * up over it; the card underneath sinks back (scales down and dims) as it is covered.
 */
export default function ProjectsDeck() {
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".deck-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        // Soft hand-over: the covered card eases back a little and a light shade settles on
        // it (an overlay's opacity, not a filter, so it stays smooth and never goes black).
        const st = { trigger: next, start: "top bottom", end: "top top", scrub: 0.6 };
        gsap.to(card.querySelector(".deck-inner"), { scale: 0.94, yPercent: -2, ease: "power1.in", scrollTrigger: st });
        gsap.to(card.querySelector(".deck-shade"), { opacity: 0.35, ease: "power1.in", scrollTrigger: st });
      });
      gsap.utils.toArray<HTMLElement>(".deck-media").forEach((media) => {
        gsap.fromTo(media, { yPercent: -8 }, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: media.closest(".deck-card"), start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, deck);
    return () => ctx.revert();
  }, []);

  return (
    <Section id="projects" tone="dark" className="pb-0" data-no-out>
      <Container>
        <SectionHeader
          index="02"
          eyebrow="Portfolio"
          title="Our projects"
          intro="From finished homes in Saburtalo to the new district rising in Varketili — every project funded from day one and delivered on time."
          action={<ButtonLink href="/projects/">All projects</ButtonLink>}
        />
      </Container>

      <div ref={deckRef} className="mt-24">
        {projects.map((p, i) => [
          // A spacer after each card lets it rest on screen before the next one slides over.
          i > 0 && <div key={`${p.id}-rest`} aria-hidden className="h-[45svh]" />,
          <article key={p.id} className="deck-card sticky top-0 h-[100svh] p-2 md:p-3" aria-labelledby={`deck-${p.id}`}>
            <div className="deck-inner relative h-full origin-top overflow-hidden rounded-[20px] bg-seu-ink ring-1 ring-white/10 will-change-transform md:rounded-[28px]">
              <div className="deck-media absolute -inset-y-[8%] inset-x-0">
                {/* Kling film made from the project render; the render is its poster. */}
                <AmbientVideo name={`deck-${p.id}`} className="h-full w-full object-cover" />
              </div>
              <div className="sunbeams sunbeams--soft" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c1613]/80 via-[#0c1613]/10 via-35% to-[#0c1613]/95" />
              <div className="deck-shade pointer-events-none absolute inset-0 z-10 bg-[#0c1613] opacity-0" />

              <div className="relative flex h-full flex-col justify-between px-[clamp(20px,3.5vw,56px)] pb-[clamp(24px,5vh,56px)] pt-28">
                <p className="eyebrow glass glass-dark self-start rounded-full py-2 pl-4 pr-5 text-white [--muted:#fff]">
                  <span className="text-[#ffd7b5]">{String(i + 1).padStart(2, "0")}</span>
                  {statusLabel[p.status]} · {p.date}
                </p>
                <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
                  <h3 id={`deck-${p.id}`} className="page-title text-[clamp(36px,4.6vw,80px)]">
                    {p.name}
                  </h3>
                  <div className="flex flex-col items-start gap-8 lg:items-end">
                    <dl className="flex gap-10 text-[15px]">
                      <div>
                        <dt className="text-white/80">Location</dt>
                        <dd className="title-m mt-1 normal-case">{p.district}</dd>
                      </div>
                      <div>
                        <dt className="text-white/80">Apartments</dt>
                        <dd className="title-m mt-1 normal-case">
                          {p.sizes[0]}–{p.sizes[1]} m²
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/80">Floors</dt>
                        <dd className="title-m mt-1 normal-case">{p.floors}</dd>
                      </div>
                    </dl>
                    <ButtonLink href={`/projects/${p.id}/`} variant={p.status === "ongoing" ? "primary" : "glass"} size="lg">
                      Explore {p.name.replace("SEU ", "")}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          </article>,
        ])}
      </div>
    </Section>
  );
}
