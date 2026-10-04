"use client";

import { useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const left = [
  { label: "Search Apartment", pill: true },
  { label: "Visual Search" },
  { label: "SEU CARD" },
];
const right = [{ label: "NEWS" }, { label: "ABOUT" }];

function NavLink({ label, pill }: { label: string; pill?: boolean }) {
  return (
    <a
      href="#"
      className={
        pill
          ? "rounded-md border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] tracking-[0.06em] backdrop-blur transition-colors hover:bg-seu-green"
          : "text-[13px] tracking-[0.06em] transition-opacity hover:opacity-70"
      }
    >
      {label}
    </a>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

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
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] duration-500 ${
        scrolled ? "bg-[#15201d]/85 backdrop-blur-md" : ""
      } ${hidden ? "-translate-y-full" : ""}`}
    >
      <div className="pointer-events-auto mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <nav className="hidden items-center gap-12 lg:flex">
          {left.map((l) => (
            <NavLink key={l.label} {...l} />
          ))}
        </nav>
        <a href="#" className="col-start-2 flex flex-col items-center" aria-label="SEU Development">
          <img src={`${basePath}/brand/logo-wire.svg`} alt="" className="h-9 w-auto" />
          <span className="mt-1 text-[13px] leading-none tracking-[0.2em]">SEU</span>
          <span className="text-[10px] text-seu-muted">Development</span>
        </a>
        <nav className="hidden items-center justify-end gap-12 lg:flex">
          {right.map((l) => (
            <NavLink key={l.label} {...l} />
          ))}
          <NavLink label="Contact us" pill />
          <div className="flex rounded-md border border-white/25 p-0.5 text-[12px]">
            <span className="rounded bg-white/20 px-2.5 py-1">EN</span>
            <span className="px-2.5 py-1 text-seu-muted">GE</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
