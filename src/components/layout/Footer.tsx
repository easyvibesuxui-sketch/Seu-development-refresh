"use client";

import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";
import { useHref, useLang } from "@/lib/useLang";

const nav = [
  { label: { en: "Projects", ka: "პროექტები" }, href: "/projects/" },
  { label: { en: "Apartments", ka: "ბინები" }, href: "/search/" },
  { label: { en: "SEU Card", ka: "SEU ბარათი" }, href: "/card/" },
  { label: { en: "News", ka: "სიახლეები" }, href: "/news/" },
  { label: { en: "About", ka: "ჩვენ შესახებ" }, href: "/about/" },
  { label: { en: "Privacy policy", ka: "კონფიდენციალურობა" }, href: "/privacy/" },
];
const socials = [
  { label: "Facebook", href: "https://www.facebook.com/SEUdevelopment", d: "M14 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H11v7H8v-7H6v-3h2V8.5A3.5 3.5 0 0 1 11.5 5H14z" },
  { label: "Instagram", href: "https://www.instagram.com/seudevelopment/", d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01" },
  { label: "YouTube", href: "https://www.youtube.com/@seudevelopment9577", d: "M3 8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5zM10 9v6l5-3z" },
];

export default function Footer() {
  const lang = useLang();
  const h = useHref();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  return (
    <footer data-tone="dark" className="tone-dark relative overflow-hidden border-t border-seu-line bg-seu-ink">
      <div className="relative mx-auto grid max-w-[1680px] gap-16 px-gutter pb-12 pt-24 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="eyebrow">{t("Get in touch", "დაგვიკავშირდით")}</p>
          <a href="tel:+995596707070" className="title-m mt-6 block transition-colors hover:text-seu-accent-hi">
            +995 596 70 70 70
          </a>
          <a href="mailto:info@seudevelopment.ge" className="lead mt-3 block text-seu-muted transition-colors hover:text-seu-accent-hi">
            info@seudevelopment.ge
          </a>
          <p className="body-copy mt-3">{t("Tbilisi, A. Politkovskaya St. 32", "თბილისი, ა. პოლიტკოვსკაიას ქ. 32")}</p>
        </div>
        <nav aria-label={t("Footer", "ქვედა მენიუ")}>
          <p className="eyebrow">{t("Explore", "ნავიგაცია")}</p>
          <ul className="mt-6 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={h(item.href)} className="label text-[13px] uppercase tracking-[0.16em] transition-colors hover:text-seu-accent-hi">
                  {item.label[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow">{t("Follow", "გამოგვყევით")}</p>
          <ul className="mt-6 flex gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={`${s.label} ${t("(opens in a new tab)", "(იხსნება ახალ ჩანართში)")}`} className="btn btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-[1680px] items-end justify-between gap-8 px-gutter pb-10">
        <p className="page-title text-[clamp(48px,9vw,168px)] leading-[0.8] text-seu-fg/90" aria-hidden data-split>
          SEU development
        </p>
        <span className="group hidden shrink-0 pb-4 md:block">
          <LogoMark className="w-20 overflow-visible lg:w-24" />
        </span>
      </div>
      <p className="relative mx-auto max-w-[1680px] border-t border-seu-line px-gutter py-6 text-[13px] text-seu-muted">
        © {new Date().getFullYear()} SEU Development · {t("Concept redesign", "კონცეფციის რედიზაინი")}
      </p>
    </footer>
  );
}
