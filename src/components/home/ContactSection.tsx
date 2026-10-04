"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";

const fields = [
  { name: "name", label: "Name", type: "text", required: false },
  { name: "phone", label: "Phone *", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: false },
];

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="grid gap-16 px-6 py-36 md:grid-cols-2">
      <div>
        <h2 className="title-display text-[clamp(30px,2.6vw,42px)]" data-split>
          Requests Call.
        </h2>
        {sent ? (
          <p className="mt-10 text-lg text-seu-green-bright">Thank you! A sales manager will contact you shortly.</p>
        ) : (
          <form
            className="mt-10 max-w-md space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {fields.map((f, i) => (
              <Reveal key={f.name} delay={i * 80}>
                <input
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  placeholder={f.label}
                  aria-label={f.label}
                  className="h-11 w-full rounded-md border border-white/60 bg-white/15 px-3 text-[14px] outline-none transition placeholder:text-white/80 focus:border-seu-green focus:bg-white/20"
                />
              </Reveal>
            ))}
            <Reveal delay={260}>
              <button
                type="submit"
                className="rounded-md bg-seu-green px-10 py-3 text-[14px] tracking-[0.08em] transition hover:brightness-110"
              >
                CONTACT
              </button>
            </Reveal>
          </form>
        )}
      </div>

      <div>
        <h2 className="title-display text-[clamp(30px,2.6vw,42px)]" data-split>
          Contact.
        </h2>
        <Reveal delay={120} className="mt-10 rounded-lg bg-[#13241e] p-5">
          <div className="flex flex-wrap gap-x-10 gap-y-2 text-[14px]">
            <a href="mailto:info@seudevelopment.ge" className="hover:text-seu-green-bright">
              ✉ Info@Seudevelopment.ge
            </a>
            <a href="tel:+995596707070" className="text-seu-muted hover:text-seu-green-bright">
              ☏ +995 596 70 70 70
            </a>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=41.7217,44.7019"
            target="_blank"
            rel="noreferrer"
            className="group relative mt-5 block h-56 overflow-hidden rounded-lg border border-white/40 bg-[#262a28]"
          >
            <MapSketch />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-seu-green-bright transition-transform group-hover:-translate-y-[120%]">
              <svg width="18" height="26" viewBox="0 0 18 26" fill="none" aria-hidden>
                <path d="M9 25s8-9.5 8-15A8 8 0 0 0 1 10c0 5.5 8 15 8 15z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="9" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
          </a>
          <p className="mt-5 text-[14px]">⌖ Tbilisi, A. Politkovskaya St. 32</p>
        </Reveal>
      </div>
    </section>
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
