import Link from "next/link";

/** "Back" pill used at the top of inner pages; same pill family as the buttons. */
export default function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="btn btn-sm group">
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden className="transition-transform group-hover:-translate-x-1">
        <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {label}
    </Link>
  );
}
