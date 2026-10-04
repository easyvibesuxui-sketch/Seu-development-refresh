import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";

const nav = [
  { label: "PROJECTS", href: "/projects/" },
  { label: "SEU CARD", href: "/card/" },
  { label: "PRIVACY POLICY", href: "/privacy/" },
  { label: "NEWS", href: "/news/" },
  { label: "ABOUT", href: "/about/" },
];
const socials = [
  { label: "Facebook", href: "https://www.facebook.com/SEUdevelopment", d: "M14 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H11v7H8v-7H6v-3h2V8.5A3.5 3.5 0 0 1 11.5 5H14z" },
  { label: "Instagram", href: "https://www.instagram.com/seudevelopment/", d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01" },
  { label: "YouTube", href: "https://www.youtube.com/@seudevelopment9577", d: "M3 8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5zM10 9v6l5-3z" },
];

export default function Footer() {
  return (
    <footer>
      <nav className="flex flex-wrap justify-center gap-x-[8vw] gap-y-4 border-t border-white/10 px-6 py-7 text-[13px] tracking-[0.18em]">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="transition-colors hover:text-seu-accent-hi">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="grid grid-cols-2 items-center gap-y-10 bg-black px-6 py-14 md:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 flex gap-8 md:order-none md:gap-12 md:pl-[4vw]">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="text-seu-muted hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                <path d={s.d} />
              </svg>
            </a>
          ))}
        </div>
        <p className="title-display order-1 col-span-2 text-center text-[clamp(26px,2.8vw,44px)] md:order-none md:col-span-1 leading-tight tracking-[0.18em] text-seu-muted" data-split>
          SEU
          <br />
          development
        </p>
        <span className="group order-3 justify-self-end md:order-none md:mr-[4vw]">
          <LogoMark className="w-16 overflow-visible md:w-24" />
        </span>
      </div>
    </footer>
  );
}
