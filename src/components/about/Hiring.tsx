"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ArrowButton } from "@/components/project/ProjectDetails";

const ROLES = [
  {
    title: "Marketing",
    lead: "Join the SEU Development team",
    body: [
      "If you want to become a professional, growth-oriented team member, send us your CV. We are looking for motivated, responsible and results-driven people who want to grow their careers in a stable and expanding company.",
      "Send us your resume through the form below. If a suitable vacancy is available, we will be sure to get in touch with you.",
    ],
  },
  {
    title: "Sales",
    lead: "Help families find their home",
    body: [
      "Work with buyers from the first visit to the keys: present projects, guide visitors through the visual search and stay with them through contract and handover.",
      "Experience in real estate or premium sales is a plus; care for people is a must.",
    ],
  },
  {
    title: "Engineering",
    lead: "Build to European standards",
    body: [
      "Site and design engineers who want to deliver fully funded projects on schedule, with energy-efficient materials and high construction standards.",
      "Send your CV and a short note about the projects you are proud of.",
    ],
  },
];

export default function Hiring() {
  const [index, setIndex] = useState(0);
  const [file, setFile] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const role = ROLES[index];

  const go = (d: number) => {
    const next = (index + d + ROLES.length) % ROLES.length;
    const card = cardRef.current;
    if (!card) return setIndex(next);
    gsap.to(card, {
      x: -40 * d,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setIndex(next);
        setSent(false);
        gsap.fromTo(card, { x: 40 * d, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
      },
    });
  };

  return (
    <section id="career" className="relative">
      <div className="bg-seu-cream text-[#15201d]">
        <div className="grid gap-12 px-6 pb-0 pt-36 md:grid-cols-2 md:px-12">
          <div className="flex flex-col pb-16">
            <h2 className="section-title uppercase" data-split>
              We are hiring.
            </h2>
            <p className="title-display mt-6 text-[26px] italic">Benefits of working with us.</p>
            <div className="mt-auto flex gap-3 pt-16 [&_button]:border-[#15201d]/50 [&_button]:text-[#15201d] [&_button:hover]:text-white">
              <ArrowButton dir="prev" onClick={() => go(-1)} label="Previous role" />
              <ArrowButton dir="next" onClick={() => go(1)} label="Next role" />
            </div>
          </div>
          <div ref={cardRef} className="relative z-10 -mb-40 rounded-t-md bg-white p-8 shadow-[0_30px_80px_#15201d26] md:rounded-md">
            <h3 className="title-display text-[28px] uppercase">{role.title}</h3>
            <p className="mt-2 text-[15px]">{role.lead}</p>
            <div className="mt-5 h-px bg-gradient-to-r from-[#15201d]/40 via-[#15201d]/40 to-transparent" />
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#15201d]/85">
              {role.body.map((p) => (
                <p key={p.slice(0, 16)}>{p}</p>
              ))}
            </div>
            {sent ? (
              <p className="mt-8 text-[15px] text-seu-accent">Thank you! Your resume has been sent.</p>
            ) : (
              <form
                className="mt-8 flex flex-wrap items-center gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (file) setSent(true);
                }}
              >
                <label className="label cursor-pointer rounded-md border border-[#15201d]/30 px-4 py-2 text-[13px] transition-colors hover:border-seu-accent">
                  <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
                  {file ?? "Attach CV (PDF, DOC)"}
                </label>
                <button
                  type="submit"
                  disabled={!file}
                  className="label rounded-md bg-seu-accent px-6 py-2.5 text-[13px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-seu-accent-hi disabled:opacity-40"
                >
                  Send resume
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 pb-16 pt-52 md:w-1/2 md:px-12 md:pt-24">
        <p className="max-w-md text-[17px] leading-[1.7] text-seu-cream/80">
          The company&apos;s team cares about continuous development and provides the best working environment.
        </p>
      </div>
    </section>
  );
}
