"use client";

import { useState } from "react";
import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";
import Icon from "@/components/ui/Icon";
import AmbientVideo from "@/components/ui/AmbientVideo";

type Lang = "ka" | "en";

// Placeholder copy until the assistant itself is designed; both languages from the start.
const COPY: Record<Lang, { eyebrow: string; hello: string; lead: string; soon: string; topics: string[]; site: string; back: string }> = {
  ka: {
    eyebrow: "ვირტუალური ასისტენტი",
    hello: "გამარჯობა",
    lead: "მალე აქ შეძლებთ ჩემთან საუბარს: გაჩვენებთ პროექტებს, გიპასუხებთ კითხვებზე ფასებსა და ბინებზე და დაგეხმარებით ვიზიტის დაჯავშნაში.",
    soon: "მალე",
    topics: ["პროექტები", "ბინები და ფასები", "ხედები", "ვიზიტის დაჯავშნა"],
    site: "საიტის დათვალიერება",
    back: "უკან",
  },
  en: {
    eyebrow: "Virtual assistant",
    hello: "Hello",
    lead: "Soon you will be able to talk to me here: I will walk you through the projects, answer questions about prices and apartments and help you book a visit.",
    soon: "Coming soon",
    topics: ["Projects", "Apartments and prices", "Views", "Book a visit"],
    site: "Explore the website",
    back: "Back",
  },
};

/** Stand-in for the assistant: her clip, a greeting in Georgian or English, and the ways out. */
export default function AssistantPlaceholder() {
  const [lang, setLang] = useState<Lang>("ka");
  const t = COPY[lang];

  return (
    <main lang={lang} className="tone-dark fixed inset-0 overflow-hidden bg-seu-ink text-white">
      <AmbientVideo name="assistant-loop" className="absolute inset-0 h-full w-full object-cover" />
      <div className="gate-shade--side pointer-events-none absolute inset-0" aria-hidden />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6 md:p-10">
        <Link href="/" className="btn btn-glass btn-sm">
          <Icon name="arrow" size={16} className="rotate-180" /> {t.back}
        </Link>
        <span className="pointer-events-none flex items-center gap-2.5" aria-hidden>
          <LogoMark className="h-8 w-auto overflow-visible" />
          <span className="label text-[12px] tracking-[0.3em]">SEU</span>
        </span>
        <div className="segmented ctl-sm border-white/40 bg-seu-ink/40 backdrop-blur" role="group" aria-label="Language / ენა">
          {(["ka", "en"] as const).map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)} className="text-white">
              {l === "ka" ? "ქარ" : "EN"}
            </button>
          ))}
        </div>
      </header>

      <section className="absolute inset-x-0 bottom-0 z-10 max-w-2xl p-6 pb-10 md:p-14" aria-labelledby="assistant-title">
        <span className="tag gap-2 border-white/30 bg-seu-ink/70 text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-seu-accent-hi" /> {t.soon}
        </span>
        <p className="eyebrow mt-6 text-white">{t.eyebrow}</p>
        <h1 id="assistant-title" className="page-title mt-4 text-[clamp(44px,6vw,96px)]">
          {t.hello}
          <span className="text-seu-accent-hi">.</span>
        </h1>
        <p className="lead mt-5 max-w-xl text-white/90">{t.lead}</p>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label={lang === "ka" ? "თემები" : "Topics"}>
          {t.topics.map((topic) => (
            <li key={topic} className="tag border-white/30 bg-seu-ink/40 py-2 text-white backdrop-blur">
              {topic}
            </li>
          ))}
        </ul>
        <Link href="/home/" className="btn btn-primary btn-lg mt-10">
          {t.site} <Icon name="arrow" size={18} />
        </Link>
      </section>
    </main>
  );
}
