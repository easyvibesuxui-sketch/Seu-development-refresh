"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="label rounded-md bg-seu-accent px-6 py-3 text-[13px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-seu-accent-hi"
    >
      Download PDF / Print
    </button>
  );
}
