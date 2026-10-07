"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { useT } from "@/lib/useLang";

// Open sheets, innermost last: only the top one answers Escape, and the page stays locked
// until the last one closes.
const stack: string[] = [];

/**
 * The site's overlay panel. `side="bottom"` rises from the bottom edge (drag the handle down
 * to close); `side="right"` slides in as a drawer. Either closes with ✕, Escape or the
 * backdrop, keeps Tab inside itself and hands focus back to whatever opened it.
 * Sheets stack: a drawer opened from a sheet sits above it and closes back to it.
 */
export default function Sheet({
  open,
  onClose,
  side = "bottom",
  eyebrow,
  title,
  label,
  tone = "dark",
  className = "",
  bodyClassName = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "bottom" | "right";
  eyebrow?: ReactNode;
  /** Visible heading; without it, pass `label` and let the content carry its own close button. */
  title?: ReactNode;
  label?: string;
  tone?: "dark" | "light";
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const id = useId();
  const t = useT();
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const closeFn = useRef(onClose);
  useEffect(() => {
    closeFn.current = onClose;
  }, [onClose]);

  // Mount, then slide in on the next frame; lock the page while any sheet is open.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    stack.push(id);
    const raf = requestAnimationFrame(() => setShown(true));
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus();

    const key = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id || !panel) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeFn.current();
      } else if (e.key === "Tab") {
        const items = [...panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])')].filter(
          (el) => el.offsetParent !== null,
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    const html = document.documentElement;
    if (stack.length === 1) html.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      setShown(false);
      window.removeEventListener("keydown", key);
      stack.splice(stack.indexOf(id), 1);
      if (!stack.length) html.style.overflow = "";
      opener?.focus?.();
    };
  }, [open, id]);

  if (!open) return null;

  const bottom = side === "bottom";
  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !panelRef.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    panelRef.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const onUp = () => {
    if (!drag.current || !panelRef.current) return;
    const far = drag.current.dy > 120;
    panelRef.current.style.transform = "";
    drag.current = null;
    if (far) onClose();
  };

  const place = bottom
    ? `inset-x-0 bottom-0 max-h-[92svh] rounded-t-[28px] border-t ${shown ? "translate-y-0" : "translate-y-full"}`
    : `inset-y-0 right-0 w-full max-w-[560px] border-l sm:rounded-l-[28px] ${shown ? "translate-x-0" : "translate-x-full"}`;

  return createPortal(
    <div className="fixed inset-0 z-[400]" data-lenis-prevent>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("Close", "დახურვა")}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-seu-ink/60 backdrop-blur-sm transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        className={`tone-${tone} absolute flex flex-col overflow-hidden border-white/10 bg-seu-bg shadow-[0_-30px_80px_rgb(0_0_0/0.45)] outline-none transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${place} ${className}`}
        style={tone === "light" ? { background: "var(--seu-paper)" } : undefined}
      >
        {bottom && (
          <div className="flex shrink-0 cursor-grab touch-none justify-center py-3 active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden>
            <span className="h-1.5 w-12 rounded-full bg-current opacity-30" />
          </div>
        )}
        {title && (
          <header className={`flex w-full shrink-0 items-start justify-between gap-6 pb-6 ${bottom ? "mx-auto max-w-[calc(1180px+2*var(--gutter))] px-gutter pt-1" : "px-8 pt-8 sm:px-10"}`}>
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h2 id={`${id}-title`} className="title-m mt-2 text-[clamp(22px,2vw,30px)]">
                {title}
              </h2>
            </div>
            <button type="button" onClick={onClose} aria-label={t("Close", "დახურვა")} className="btn btn-icon" data-autofocus>
              <Icon name="close" size={18} />
            </button>
          </header>
        )}
        <div className={`min-h-0 flex-auto overflow-y-auto ${bodyClassName}`}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
