"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

export type Option<T extends string> = { value: T; label: string };

/**
 * The site's dropdown: a field-shaped trigger and its own listbox in the tone's popover
 * colour, so no system menu ever shows. Keyboard as a native select: arrows, Home/End,
 * a letter to jump, Enter or Space to choose, Escape or Tab to close.
 */
export default function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  const show = (at = selected) => {
    setActive(at);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (i: number) => {
    onChange(options[i].value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const away = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      show();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const move: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last };
    if (e.key in move) {
      e.preventDefault();
      setActive(move[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    } else if (e.key.length === 1) {
      const k = e.key.toLowerCase();
      const from = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
      const hit = from >= 0 ? from : options.findIndex((o) => o.label.toLowerCase().startsWith(k));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span id={`${id}-label`} className="field-label">
        {label}
      </span>
      <button
        ref={buttonRef}
        id={`${id}-button`}
        type="button"
        className="field select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-labelledby={`${id}-label ${id}-button`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKey}
      >
        <span className="truncate">{options[selected]?.label}</span>
        <Icon name="chevron" size={18} className="select-chevron" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          className="select-menu"
          data-lenis-prevent
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === selected}
              data-active={i === active}
              className="select-option"
              onPointerMove={() => setActive(i)}
              onClick={() => choose(i)}
            >
              {o.label}
              <Icon name="check" size={16} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
