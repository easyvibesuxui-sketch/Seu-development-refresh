"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

const fields = [
  { name: "name", label: "Name", type: "text", required: false, autoComplete: "name" },
  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", required: false, autoComplete: "email" },
];

export default function ContactSection({ split = false }: { split?: boolean }) {
  const [sent, setSent] = useState(false);

  return (
    <Section id="contact" tone="dark">
      <Container className="grid gap-20 lg:grid-cols-2 lg:gap-28">
        <div>
          <SectionHeader index={split ? undefined : "08"} eyebrow="Talk to sales" title="Request a call" className="lg:grid-cols-1" />
          {sent ? (
            <p role="status" className="lead mt-12 text-seu-accent-hi">
              Thank you! A sales manager will call you shortly.
            </p>
          ) : (
            <form
              className="mt-12 max-w-lg space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {fields.map((f, i) => (
                <Reveal key={f.name} delay={i * 80}>
                  <label className="block">
                    <span className="field-label">
                      {f.label}
                      {f.required && <span className="text-seu-accent-hi"> *</span>}
                    </span>
                    <input name={f.name} type={f.type} required={f.required} autoComplete={f.autoComplete} className="field" />
                  </label>
                </Reveal>
              ))}
              <Reveal delay={260}>
                <button type="submit" className="btn btn-primary btn-lg mt-4">
                  Request a call
                </button>
              </Reveal>
            </form>
          )}
        </div>

        <div className={split ? "lg:pt-40" : ""}>
          <p className="eyebrow">Visit us</p>
          <Reveal delay={120} className="mt-8 overflow-hidden rounded-[24px] border border-seu-line bg-seu-surface">
            <a
              href="https://www.google.com/maps/search/?api=1&query=41.7217,44.7019"
              target="_blank"
              rel="noreferrer"
              aria-label="Open the office location in Google Maps (opens in a new tab)"
              className="group relative block h-64 overflow-hidden bg-seu-ink"
            >
              <MapSketch />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-seu-accent-hi transition-transform group-hover:-translate-y-[120%]">
                <svg width="22" height="30" viewBox="0 0 18 26" fill="none" aria-hidden>
                  <path d="M9 25s8-9.5 8-15A8 8 0 0 0 1 10c0 5.5 8 15 8 15z" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="9" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
            </a>
            <dl className="grid gap-6 p-8 sm:grid-cols-2">
              <div>
                <dt className="field-label">Office</dt>
                <dd className="lead">Tbilisi, A. Politkovskaya St. 32</dd>
              </div>
              <div>
                <dt className="field-label">Phone</dt>
                <dd>
                  <a href="tel:+995596707070" className="lead hover:text-seu-accent-hi">
                    +995 596 70 70 70
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="field-label">Email</dt>
                <dd>
                  <a href="mailto:info@seudevelopment.ge" className="lead hover:text-seu-accent-hi">
                    info@seudevelopment.ge
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/** Lightweight street-map drawing so the contact card doesn't load a second WebGL map. */
function MapSketch() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g stroke="#ffffff" strokeOpacity=".16" fill="none">
        <path d="M-10 160 C80 140 150 150 220 110 S330 40 420 30" strokeWidth="6" />
        <path d="M60 -10 L120 230" strokeWidth="3" />
        <path d="M250 -10 L190 230" strokeWidth="2" />
        <path d="M-10 70 L420 120" strokeWidth="2" />
        <path d="M300 230 L360 -10" strokeWidth="1.5" />
        <path d="M-10 200 L420 180" strokeWidth="1.5" />
        <path d="M30 -10 L-10 120" strokeWidth="1" />
        <path d="M150 -10 L170 230" strokeWidth="1" />
        <path d="M-10 30 L420 75" strokeWidth="1" />
      </g>
    </svg>
  );
}
