"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import type { Option } from "@/components/ui/Select";

export type PillSegment = { id: string; icon: IconName; label: string; value: string; set: boolean; panel: (close: () => void) => ReactNode; className?: string };

/**
 * The search pill (Airbnb-like): labelled parts in one rounded bar, each opening a small panel
 * under it. `end` sits after the parts: the apartment search puts its round button there.
 */
export default function SearchPill({ segments, label, end, className = "" }: { segments: PillSegment[]; label: string; end?: ReactNode; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trigger = (seg: string) => document.getElementById(`${id}-${seg}-trigger`);

  useEffect(() => {
    if (!open) return;
    // Into the panel: the chosen option, or its first control.
    const panel = document.getElementById(`${id}-${open}`);
    panel?.querySelector<HTMLElement>("[data-autofocus], button, input")?.focus();
    const away = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      trigger(open)?.focus();
      setOpen(null);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (open) trigger(open)?.focus();
    setOpen(null);
  };

  return (
    <div ref={rootRef} role="search" aria-label={label} className={`search-pill relative items-stretch p-1.5 ${open ? "search-pill--open" : ""} ${className}`}>
      {segments.map((s, i) => (
        <div key={s.id} className={`relative min-w-0 flex-1 ${s.className ?? ""}`}>
          <button
            id={`${id}-${s.id}-trigger`}
            type="button"
            aria-expanded={open === s.id}
            aria-controls={open === s.id ? `${id}-${s.id}` : undefined}
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className="search-pill__seg"
          >
            {i > 0 && <span aria-hidden className="search-pill__rule" />}
            <span className="flex items-center gap-1.5 text-[12px] font-semibold">
              <Icon name={s.icon} size={14} />
              {s.label}
            </span>
            <span className={`block truncate text-[14px] ${s.set ? "text-seu-fg" : "text-seu-muted"}`}>{s.value}</span>
          </button>
          {open === s.id && (
            <div id={`${id}-${s.id}`} role="dialog" aria-label={s.label} className={`search-pill__panel ${i === segments.length - 1 && i > 0 ? "right-0" : "left-0"}`} data-lenis-prevent>
              {s.panel(close)}
            </div>
          )}
        </div>
      ))}
      {end}
    </div>
  );
}

/** A panel's choices: one button per option, the chosen one marked. */
export function OptionList<T extends string>({ options, value, onPick }: { options: Option<T>[]; value: T; onPick: (v: T) => void }) {
  return (
    <ul className="max-h-[320px] w-[280px] overflow-y-auto p-2">
      {options.map((o) => (
        <li key={o.value}>
          <button type="button" aria-pressed={o.value === value} onClick={() => onPick(o.value)} className="search-pill__option" data-autofocus={o.value === value ? "" : undefined}>
            {o.label}
            {o.value === value && <Icon name="check" size={16} />}
          </button>
        </li>
      ))}
    </ul>
  );
}
