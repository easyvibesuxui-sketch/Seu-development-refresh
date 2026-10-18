import type { Ref } from "react";

/** The sun study's round button: copper with a light ring, its name on hover and focus. */
export default function SunButton({ label, onClick, ref, className = "" }: { label: string; onClick: () => void; ref?: Ref<HTMLButtonElement>; className?: string }) {
  return (
    <div className={className}>
      <span className="tip tip--up block" data-tip={label}>
        <button
          ref={ref}
          type="button"
          aria-haspopup="dialog"
          aria-label={label}
          onClick={onClick}
          className="grid h-14 w-14 place-items-center rounded-full bg-seu-accent text-white shadow-[0_0_0_6px_rgb(168_84_31/0.28),0_12px_32px_rgb(0_0_0/0.5)] ring-1 ring-white/60 transition-colors hover:bg-seu-accent-lo focus-visible:bg-seu-accent-lo"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <path d="M1 13h18M5 13a5 5 0 0 1 10 0M10 2v2M3.5 5l1.4 1.4M16.5 5l-1.4 1.4M1 9h2M17 9h2" />
          </svg>
        </button>
      </span>
    </div>
  );
}
