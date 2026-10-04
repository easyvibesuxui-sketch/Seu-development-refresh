"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { blockById, type Unit } from "@/data/inventory";
import { Chip } from "./ApartmentCard";

/** "Request call" dialog from the design, with the apartment the visitor is asking about. */
export default function RequestCallModal(props: { unit?: Unit; open: boolean; onClose: () => void }) {
  // Remount per opening so the form starts fresh each time.
  return props.open ? <Dialog {...props} /> : null;
}

function Dialog({ unit, open, onClose }: { unit?: Unit; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (el) {
      gsap.fromTo(el.querySelector(".rc-backdrop"), { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(el.querySelector(".rc-panel"), { y: 40, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" });
      gsap.fromTo(el.querySelector(".rc-unit"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "expo.out" });
      el.querySelector<HTMLInputElement>("input")?.focus();
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const block = unit ? blockById(unit.block) : undefined;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Request call" className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="rc-backdrop absolute inset-0 bg-[#0b120f]/70 backdrop-blur-md" onClick={onClose} />
      <div className="rc-panel relative grid w-full max-w-4xl gap-8 rounded-md bg-seu-cream p-8 text-[#15201d] md:grid-cols-[1fr_280px] md:p-10">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 p-2 text-[#15201d]/70 hover:text-[#15201d]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
        <div>
          <h2 className="title-display text-[clamp(28px,2.6vw,40px)]">Request Call</h2>
          {sent ? (
            <p className="mt-10 text-lg">Thank you! A sales manager will contact you shortly.</p>
          ) : (
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {[
                { name: "name", label: "Name *", type: "text", required: true },
                { name: "phone", label: "Phone *", type: "tel", required: true },
                { name: "email", label: "Email", type: "email", required: false },
              ].map((f) => (
                <input
                  key={f.name}
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  placeholder={f.label}
                  aria-label={f.label}
                  className="h-12 w-full rounded-md border border-[#15201d]/20 bg-[#15201d]/8 px-4 text-[15px] outline-none transition placeholder:text-[#15201d]/55 focus:border-seu-accent focus:bg-white"
                />
              ))}
              <button
                type="submit"
                className="label mt-4 rounded-md bg-seu-accent px-12 py-3.5 text-[13px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-seu-accent-hi"
              >
                Contact
              </button>
            </form>
          )}
        </div>
        {unit && (
          <div className="rc-unit hidden flex-col rounded-md border border-[#15201d]/15 bg-white p-5 md:flex">
            <p className="title-display text-[18px] uppercase">Apartment {unit.number}</p>
            <img src={withBase("/images/apartment-3d.png")} alt="" className="my-4 rounded bg-[#313b38]" />
            <div className="flex flex-wrap gap-2 [&>span]:border [&>span]:border-[#15201d]/15">
              <Chip>Varketili</Chip>
              <Chip>{block?.name}</Chip>
            </div>
            <p className="mt-4 text-[14px] text-[#15201d]/75">
              Floor {unit.floor} · {unit.totalArea} m² · {unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} bedroom`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
