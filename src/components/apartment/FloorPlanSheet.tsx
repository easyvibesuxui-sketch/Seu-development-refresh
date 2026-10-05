"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { blockById, statusText, unitsOn, type Unit } from "@/data/inventory";
import { PLAN, PLAN_RATIO, UNIT_SHAPES, centre } from "@/data/floorplan";
import Icon from "@/components/ui/Icon";

const fill: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

/**
 * Bottom sheet with the whole floor around a flat: it rises from the bottom edge over a dimmed
 * page, shows this flat lit on the floor plan with its neighbours by status (the other open
 * ones link on), and closes with ✕, Escape, the backdrop or a downward drag of the handle.
 */
export default function FloorPlanSheet({ unit, open, onClose }: { unit: Unit; open: boolean; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const block = blockById(unit.block);
  const floor = unitsOn(unit.block, unit.floor);

  // Mount, then slide in on the next frame; slide out before unmounting.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShown(true));
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      setShown(false);
      window.removeEventListener("keydown", key);
      html.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !sheetRef.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    sheetRef.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const onUp = () => {
    if (!drag.current || !sheetRef.current) return;
    const far = drag.current.dy > 120;
    sheetRef.current.style.transform = "";
    drag.current = null;
    if (far) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[400]" data-lenis-prevent>
      <button
        type="button"
        aria-label="Close floor plan"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-seu-ink/60 backdrop-blur-sm transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="floor-sheet-title"
        className={`tone-dark absolute inset-x-0 bottom-0 max-h-[92svh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-seu-bg px-gutter pb-10 pt-3 shadow-[0_-30px_80px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          shown ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-[1180px]">
          {/* Drag handle */}
          <div className="flex cursor-grab touch-none justify-center py-2 active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden>
            <span className="h-1.5 w-12 rounded-full bg-white/30" />
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Floor plan</p>
              <h2 id="floor-sheet-title" className="title-m mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-[clamp(22px,2vw,30px)]">
                <span className="flex items-center gap-2">
                  <Icon name="block" size={22} className="text-seu-accent-hi" /> {block?.name}
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="floor" size={22} className="text-seu-accent-hi" /> Floor {unit.floor}
                </span>
              </h2>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close floor plan" className="btn btn-icon">
              <Icon name="close" size={18} />
            </button>
          </div>

          <p className="label mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">North · Hualing</p>
          <div className="relative mt-2" style={{ aspectRatio: `${PLAN_RATIO}` }}>
            <img src={withBase(PLAN)} alt={`Plan of floor ${unit.floor}, ${block?.name}`} className="h-full w-full rounded-[16px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {floor.map((u) => (
                <polygon
                  key={u.id}
                  points={UNIT_SHAPES[u.slot].map((p) => p.join(",")).join(" ")}
                  fill={u.id === unit.id ? "#e39a62" : fill[u.status]}
                  fillOpacity={u.id === unit.id ? 0.55 : 0.18}
                  stroke={u.id === unit.id ? "#ffd2ad" : "none"}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {floor.map((u) => {
              const [cx, cy] = centre(UNIT_SHAPES[u.slot]);
              const here = u.id === unit.id;
              const badge = (
                <span
                  className={`label flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] shadow-lg ${here ? "bg-seu-accent text-white" : "bg-seu-ink/85 text-white ring-1 ring-white/25"}`}
                >
                  {u.status === "sold" && <Icon name="lock" size={12} />}
                  {u.number}
                  {here && <span className="hidden sm:inline">· this flat</span>}
                </span>
              );
              const style = { left: `${cx}%`, top: `${cy}%` };
              return here || u.status === "sold" ? (
                <span key={u.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={style} aria-hidden={!here}>
                  {badge}
                </span>
              ) : (
                <Link
                  key={u.id}
                  href={`/apartments/${u.id}/`}
                  onClick={onClose}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                  style={style}
                  aria-label={`Apartment ${u.number}, ${statusText[u.status]}`}
                >
                  {badge}
                </Link>
              );
            })}
          </div>
          <p className="label mt-2 text-center text-[11px] uppercase tracking-[0.2em] text-seu-muted">South · Tbilisi Sea</p>

          <ul className="mt-6 flex flex-wrap justify-center gap-5 text-[12px]">
            <li className="label flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e39a62]" /> This flat
            </li>
            {(["available", "reserved", "sold"] as const).map((s) => (
              <li key={s} className="label flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: fill[s] }} />
                {statusText[s]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
