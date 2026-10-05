"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ArrowButton } from "@/components/project/ProjectDetails";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

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
    <Section id="career" tone="light">
      <Container className="grid gap-16 md:grid-cols-2">
        <div className="flex flex-col">
          <SectionHeader index="03" eyebrow="Benefits of working with us" title="We are hiring" className="lg:grid-cols-1" />
          <p className="body-copy mt-10 max-w-md">
            The company&apos;s team cares about continuous development and provides the best working environment.
          </p>
          <div className="mt-auto flex items-center gap-3 pt-16">
            <ArrowButton dir="prev" onClick={() => go(-1)} label="Previous role" />
            <ArrowButton dir="next" onClick={() => go(1)} label="Next role" />
            <p className="label ml-4 text-[13px] tabular-nums text-seu-muted" aria-live="polite">
              {index + 1} / {ROLES.length}
            </p>
          </div>
        </div>
        <div ref={cardRef} className="rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgb(19_33_29/0.12)] md:p-12">
          <p className="eyebrow">Open role</p>
          <h3 className="section-title mt-4 text-[clamp(30px,2.6vw,44px)]">{role.title}</h3>
          <p className="lead mt-3">{role.lead}</p>
          <div className="mt-8 h-px bg-seu-line" />
          <div className="body-copy mt-8 space-y-5">
            {role.body.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
          </div>
          {sent ? (
            <p role="status" className="lead mt-10 text-seu-accent-hi">
              Thank you! Your resume has been sent.
            </p>
          ) : (
            <form
              className="mt-10 flex flex-wrap items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (file) setSent(true);
              }}
            >
              <label className="btn cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-seu-accent-hi">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
                {file ?? "Attach CV (PDF, DOC)"}
              </label>
              <button type="submit" disabled={!file} className="btn btn-primary">
                Send resume
              </button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
