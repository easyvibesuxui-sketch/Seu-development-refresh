"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/brand/LogoMark";
import Icon from "@/components/ui/Icon";
import RequestCallModal from "@/components/ui/RequestCallModal";
import { langOf, localize } from "@/lib/i18n";

const links = [
  { label: { en: "Projects", ka: "პროექტები" }, href: "/projects/" },
  { label: { en: "Visual search", ka: "ვიზუალური ძებნა" }, href: "/projects/varketili/" },
  { label: { en: "Apartments", ka: "ბინები" }, href: "/search/" },
  { label: { en: "SEU Card", ka: "SEU ბარათი" }, href: "/card/" },
  { label: { en: "News", ka: "სიახლეები" }, href: "/news/" },
  { label: { en: "About", ka: "ჩვენ შესახებ" }, href: "/about/" },
];

const same = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

/**
 * Glass navigation pill. It reads the tone of the section beneath it (`data-tone`) and
 * switches between light-on-dark and dark-on-light, stays in view the whole way down, and opens
 * a full-screen menu on small screens.
 */
export default function Header() {
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const pathname = usePathname();
  const lang = langOf(pathname);
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const h = (href: string) => localize(href, lang);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // The floating call button steps aside while another way to ask for a call (a form, the
  // apartment's own button) or the footer is on screen, so it never doubles up or covers it.
  const [callInView, setCallInView] = useState(false);
  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setCallInView(seen.size > 0);
    });
    // Pages stream in after navigation; look for the targets once the new page has rendered.
    const timer = window.setTimeout(() => document.querySelectorAll("[data-call]").forEach((el) => io.observe(el)), 300);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      setCallInView(false);
    };
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The tone of whichever section is under the bar's middle line.
      const probe = 44;
      const sections = document.querySelectorAll<HTMLElement>("[data-tone]");
      let tone = "dark";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) tone = s.dataset.tone ?? "dark";
      }
      setLight(tone === "light");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Pages that stream in after hydration (search, suspense) change what sits under the bar.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // After a client-side navigation the clicked header link would keep focus (and show its focus
  // ring once the page is scrolled with the keyboard); hand focus to the new page instead.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest("header")) document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  // Escape closes the menu and returns focus to the burger; following a link closes it too.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  const tone = light && !open ? "vars-light" : "";

  return (
    <>
      <a href="#main" className="skip-link">
        {t("Skip to content", "კონტენტზე გადასვლა")}
      </a>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 ${tone}`}
      >
        <div className="pointer-events-auto flex items-stretch gap-2 max-sm:w-full">
          <nav
            className={`flex h-14 items-center gap-1 rounded-full border pl-4 pr-2 text-seu-fg max-sm:flex-1 max-sm:justify-between max-sm:pl-3 backdrop-blur-md backdrop-saturate-150 transition-colors duration-500 ${
              light && !open ? "border-[#111923]/10 bg-[#f6f1e8]/80" : "border-white/15 bg-[#0e141b]/55"
            }`}
            aria-label={t("Main", "მთავარი")}
          >
            <Link href={h("/home/")} className="group flex min-h-11 min-w-11 items-center gap-2.5 sm:mr-2 sm:pr-2" aria-label={t("SEU Development home", "SEU Development — მთავარი")}>
              <LogoMark className="h-8 w-auto overflow-visible" />
              <span className="hidden flex-col leading-none sm:flex">
                <span className="label text-[12px] tracking-[0.3em]">SEU</span>
                <span className="text-[12px] leading-none text-seu-muted">Development</span>
              </span>
            </Link>
            {/* Phones: logo on the left, search in the middle, menu on the right. */}
            <div className="flex items-center sm:hidden">
              <Link href={h("/search/")} aria-label={t("Search apartments", "ბინების ძებნა")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-seu-go text-seu-go-ink transition-colors hover:bg-seu-go-hover">
                <Icon name="search" size={18} strokeWidth={2} />
              </Link>
            </div>
            <ul className="hidden items-center xl:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={h(l.href)}
                    aria-current={same(pathname, h(l.href)) ? "page" : undefined}
                    className="label relative block rounded-full px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] transition-colors hover:text-seu-accent-hi aria-[current=page]:text-seu-accent-hi"
                  >
                    {l.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              ref={burgerRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t("Close menu", "მენიუს დახურვა") : t("Open menu", "მენიუს გახსნა")}
              onClick={() => setOpen(!open)}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10 sm:ml-1 xl:hidden"
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </nav>
          {/* Shortcut to search only where the "Apartments" link is folded into the menu. */}
          <Link href={h("/search/")} aria-label={t("Search apartments", "ბინების ძებნა")} className={`btn btn-icon ctl-lg hidden backdrop-blur-md sm:inline-flex xl:hidden ${light && !open ? "border-[#111923]/15 bg-[#f6f1e8]/80" : "border-white/20 bg-[#0e141b]/55"}`}>
            <Icon name="search" size={18} strokeWidth={2} />
          </Link>
          {/* The same page in the other language: its own pill, between the menu and the contact button. */}
          <div
            className={`label hidden h-14 items-center gap-1 rounded-full border px-3 text-[12px] tracking-[0.1em] text-seu-fg backdrop-blur-md transition-colors duration-500 sm:flex ${
              light && !open ? "border-[#111923]/10 bg-[#f6f1e8]/80" : "border-white/15 bg-[#0e141b]/55"
            }`}
            role="group"
            aria-label={t("Language", "ენა")}
          >
            {(["ka", "en"] as const).map((l, i) => (
              <span key={l} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="text-seu-muted" aria-hidden>
                    /
                  </span>
                )}
                <Link
                  href={localize(pathname, l)}
                  lang={l}
                  hrefLang={l}
                  aria-current={lang === l ? "true" : undefined}
                  className="grid min-h-11 min-w-9 place-items-center rounded-full px-1 text-seu-muted transition-colors hover:text-seu-accent-hi aria-[current=true]:text-seu-fg"
                >
                  {l === "ka" ? "ქარ" : "EN"}
                </Link>
              </span>
            ))}
          </div>
          <Link href={h("/contact/")} className="btn btn-primary ctl-lg hidden sm:inline-flex">
            {t("Contact us", "კონტაქტი")}
          </Link>
        </div>
      </header>
      {/* Phones: the call request floats in the bottom left corner on light glass. */}
      {!open && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-hidden={callInView || undefined}
          tabIndex={callInView ? -1 : undefined}
          onClick={() => setCalling(true)}
          className={`vars-light glass fixed bottom-5 left-4 z-40 flex h-12 items-center gap-2 rounded-full pl-4 pr-5 text-[13px] font-semibold text-seu-fg transition-[opacity,transform] duration-300 sm:hidden ${
            callInView ? "pointer-events-none translate-y-4 opacity-0" : ""
          }`}
        >
          <Icon name="phone" size={16} className="text-seu-accent" />
          {t("Request a call", "ზარის მოთხოვნა")}
        </button>
      )}
      <RequestCallModal open={calling} onClose={() => setCalling(false)} />

      <div
        id="site-menu"
        ref={menuRef}
        hidden={!open}
        className="site-menu fixed inset-0 z-40 overflow-y-auto bg-seu-bg px-gutter pb-12 pt-32"
        data-lenis-prevent
      >
        <nav aria-label={t("Menu", "მენიუ")}>
          <ul className="space-y-2">
            {links.map((l, i) => (
              <li key={l.href} style={{ animationDelay: `${0.05 + i * 0.05}s` }} className="site-menu-item">
                <Link
                  href={h(l.href)}
                  aria-current={same(pathname, h(l.href)) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="title-m block py-2 text-[clamp(34px,9vw,52px)] aria-[current=page]:text-seu-accent-hi"
                >
                  {l.label[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 flex gap-2" role="group" aria-label={t("Language", "ენა")}>
          {(["ka", "en"] as const).map((l) => (
            <Link
              key={l}
              href={localize(pathname, l)}
              lang={l}
              hrefLang={l}
              aria-current={lang === l ? "true" : undefined}
              onClick={() => setOpen(false)}
              className="btn btn-sm aria-[current=true]:border-seu-accent-hi aria-[current=true]:text-seu-accent-hi"
            >
              {l === "ka" ? "ქართული" : "English"}
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={h("/contact/")} className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>
            {t("Contact us", "კონტაქტი")}
          </Link>
          <a href="tel:+995596707070" className="btn btn-lg">
            +995 596 70 70 70
          </a>
        </div>
      </div>
    </>
  );
}
