"use client";

import { useEffect, useState } from "react";
import LogoMark from "@/components/brand/LogoMark";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Visual search", href: "#" },
  { label: "SEU Card", href: "#" },
  { label: "News", href: "#" },
  { label: "About", href: "#about" },
];

/** Compact glass navigation bar with accent actions beside it (per the m² reference). */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lang, setLang] = useState<"EN" | "GE">("EN");

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY && y > window.innerHeight * 0.6);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 transition-transform duration-500 ${
        hidden ? "-translate-y-[130%]" : ""
      }`}
    >
      <div className="pointer-events-auto flex items-stretch gap-2">
        <nav
          className={`flex h-12 items-center gap-1 rounded-xl border border-white/15 pl-3 pr-2 backdrop-blur-xl transition-colors duration-500 ${
            scrolled ? "bg-[#101a17]/85" : "bg-[#101a17]/45"
          }`}
          aria-label="Main"
        >
          <a href="#" className="group mr-3 flex items-center gap-2" aria-label="SEU Development home">
            <LogoMark className="h-8 w-auto overflow-visible" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="label text-[12px] tracking-[0.3em]">SEU</span>
              <span className="text-[9px] text-seu-muted">Development</span>
            </span>
          </a>
          <ul className="hidden items-center lg:flex">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="label relative block px-3.5 py-2 text-[12px] tracking-[0.12em] uppercase transition-colors after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:text-seu-accent-hi hover:after:origin-left hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "GE" : "EN")}
            className="label ml-2 flex items-center gap-1 rounded-md px-2.5 py-2 text-[12px] tracking-[0.1em] transition-colors hover:bg-white/10"
            aria-label="Switch language"
          >
            {lang}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </nav>
        <a
          href="#choose-view"
          aria-label="Search apartments"
          className="grid h-12 w-12 place-items-center rounded-xl bg-seu-accent transition-colors hover:bg-seu-accent-hi"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.6" />
            <path d="M12.5 12.5L17 17" stroke="#fff" strokeWidth="1.6" />
          </svg>
        </a>
        <a
          href="#contact"
          className="label hidden h-12 items-center rounded-xl bg-seu-accent px-6 text-[12px] tracking-[0.14em] uppercase transition-colors hover:bg-seu-accent-hi sm:flex"
        >
          Contact us
        </a>
      </div>
    </header>
  );
}
