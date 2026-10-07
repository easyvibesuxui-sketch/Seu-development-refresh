"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { blockById, blockNameIn, bedroomsIn, type Unit } from "@/data/inventory";
import { useLang } from "@/lib/useLang";
import { Chip } from "./ApartmentCard";

/** "Request call" dialog from the design, with the apartment the visitor is asking about. */
export default function RequestCallModal(props: { unit?: Unit; open: boolean; onClose: () => void }) {
  // Remount per opening so the form starts fresh each time.
  return props.open ? <Dialog {...props} /> : null;
}

function Dialog({ unit, open, onClose }: { unit?: Unit; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (el) {
      gsap.fromTo(el.querySelector(".rc-backdrop"), { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(el.querySelector(".rc-panel"), { y: 40, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" });
      gsap.fromTo(el.querySelector(".rc-unit"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "expo.out" });
      el.querySelector<HTMLInputElement>("input")?.focus();
      document.documentElement.classList.add("menu-open");
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open, onClose]);

  if (!open) return null;
  const block = unit ? blockById(unit.block) : undefined;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t("Request a call", "ზარის მოთხოვნა")} className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="rc-backdrop absolute inset-0 bg-seu-ink/70 backdrop-blur-md" onClick={onClose} />
      <div className="rc-panel tone-light relative grid w-full max-w-4xl gap-10 rounded-[28px] p-8 md:grid-cols-[1fr_300px] md:p-12">
        <button type="button" onClick={onClose} aria-label={t("Close", "დახურვა")} className="absolute right-5 top-5 p-2 text-seu-ink/70 hover:text-seu-ink">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
        <div>
          <h2 className="section-title text-[clamp(30px,2.6vw,44px)]">{t("Request a call", "მოითხოვე ზარი")}<span className="text-seu-accent-hi">.</span></h2>
          {sent ? (
            <p role="status" className="lead mt-10">{t("Thank you! A sales manager will call you shortly.", "მადლობა! გაყიდვების მენეჯერი მალე დაგიკავშირდებათ.")}</p>
          ) : (
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {[
                { name: "name", label: t("Name", "სახელი"), type: "text", required: true, auto: "name" },
                { name: "phone", label: t("Phone", "ტელეფონი"), type: "tel", required: true, auto: "tel" },
                { name: "email", label: t("Email", "ელ. ფოსტა"), type: "email", required: false, auto: "email" },
              ].map((f) => (
                <label key={f.name} className="block">
                  <span className="field-label">
                    {f.label}
                    {f.required && <span className="text-seu-accent-hi"> *</span>}
                  </span>
                  <input name={f.name} type={f.type} required={f.required} autoComplete={f.auto} className="field" />
                </label>
              ))}
              <button type="submit" className="btn btn-primary btn-lg mt-4">
                {t("Request a call", "ზარის მოთხოვნა")}
              </button>
            </form>
          )}
        </div>
        {unit && (
          <div className="rc-unit hidden flex-col rounded-[20px] border border-seu-line bg-white p-5 md:flex">
            <p className="title-display text-[18px] uppercase">{t("Apartment", "ბინა")} {unit.number}</p>
            <img src={withBase("/images/apartment-3d.webp")} alt="" className="my-4 w-full object-contain" />
            <div className="flex flex-wrap gap-2 [&>span]:border [&>span]:border-seu-ink/15">
              <Chip>{t("Varketili", "ვარკეთილი")}</Chip>
              <Chip>{block && blockNameIn(block, lang)}</Chip>
            </div>
            <p className="mt-4 text-[14px] text-seu-ink/75">
              {t("Floor", "სართული")} {unit.floor} · {unit.totalArea} {t("m²", "მ²")} · {bedroomsIn(unit.bedrooms, lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
