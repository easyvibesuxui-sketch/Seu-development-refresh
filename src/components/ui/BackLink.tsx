import Link from "next/link";

export default function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="label group inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1.5 text-[13px] tracking-[0.06em] transition-colors hover:border-seu-accent-hi hover:text-seu-accent-hi"
    >
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden className="transition-transform group-hover:-translate-x-1">
        <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {label}
    </Link>
  );
}
