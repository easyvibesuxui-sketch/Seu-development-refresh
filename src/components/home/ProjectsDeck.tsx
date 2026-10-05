"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, statusLabel, withBase } from "@/data/projects";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

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
        gsap.to(card.querySelector(".deck-inner"), {
          scale: 0.92,
          yPercent: -3,
          filter: "brightness(0.6)",
          borderRadius: 28,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
        });
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
          <article key={p.id} className="deck-card sticky top-0 h-[100svh] overflow-hidden" aria-labelledby={`deck-${p.id}`}>
            <div className="deck-inner relative h-full origin-top overflow-hidden bg-seu-ink will-change-transform">
              <div className="deck-media absolute -inset-y-[8%] inset-x-0">
                <img
                  src={withBase(p.image)}
                  alt={`${p.name} render`}
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{ objectPosition: p.imagePosition }}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="sunbeams sunbeams--soft" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c1613]/55 via-transparent via-40% to-[#0c1613]/90" />

              <div className="relative mx-auto flex h-full max-w-[1680px] flex-col justify-between px-gutter pb-14 pt-32">
                <p className="eyebrow text-seu-fg">
                  <span className="text-seu-accent-hi">{String(i + 1).padStart(2, "0")}</span>
                  {statusLabel[p.status]} · {p.date}
                </p>
                <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
                  <h3 id={`deck-${p.id}`} className="page-title">
                    {p.name}
                  </h3>
                  <div className="flex flex-col items-start gap-8 lg:items-end">
                    <dl className="flex gap-10 text-[15px]">
                      <div>
                        <dt className="text-seu-muted">Location</dt>
                        <dd className="title-m mt-1 normal-case">{p.district}</dd>
                      </div>
                      <div>
                        <dt className="text-seu-muted">Apartments</dt>
                        <dd className="title-m mt-1 normal-case">
                          {p.sizes[0]}–{p.sizes[1]} m²
                        </dd>
                      </div>
                      <div>
                        <dt className="text-seu-muted">Floors</dt>
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
