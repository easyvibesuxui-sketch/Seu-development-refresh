"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withBase } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const paragraphs = [
  "SEU Development has been operating in the real estate market since 2014.",
  "The company's team, consisting of experienced professionals who care about continuous development, implements high construction standards and uses innovative and modern approaches that meet European standards.",
  "Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University, which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi. All SEU Development construction projects are fully funded at an early stage, which ensures they are completed on time.",
];

// The colour mark is three stacked slabs; each is a clipped copy of the same image.
const SLABS = [
  { clip: "inset(0 0 63% 0)", from: { xPercent: -70, yPercent: -20, rotate: -6 } },
  { clip: "inset(30% 0 30% 0)", from: { xPercent: 70, yPercent: 0, rotate: 5 } },
  { clip: "inset(62% 0 0 0)", from: { xPercent: -50, yPercent: 30, rotate: -4 } },
];

export default function AboutSeu() {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".seu-slab").forEach((slab, i) => {
        gsap.fromTo(
          slab,
          { ...SLABS[i].from, opacity: 0 },
          {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: mark, start: "top 90%", end: "center 55%", scrub: 1 },
          },
        );
      });
    }, mark);
    return () => ctx.revert();
  }, []);

  return (
    <section className="overflow-hidden bg-seu-cream px-6 py-32 text-[#1d1d1b]">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <div className="max-w-md">
          <h2 className="section-title" data-split>
            About SEU.
          </h2>
          <div className="mt-10 space-y-5 text-[15px] leading-relaxed" data-stagger>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div>
              <a
                href="#contact"
                className="mt-6 inline-block rounded bg-seu-accent px-10 py-3 text-[14px] tracking-[0.08em] text-white transition hover:brightness-110"
              >
                CONTACT
              </a>
            </div>
          </div>
        </div>
        <div ref={markRef} className="relative mx-auto aspect-[500/460] w-[min(440px,80%)]">
          {SLABS.map((slab, i) => (
            <img
              key={i}
              src={withBase("/images/seu-s-color.png")}
              alt={i === 0 ? "SEU logo" : ""}
              className="seu-slab absolute inset-0 h-full w-full"
              style={{ clipPath: slab.clip }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
