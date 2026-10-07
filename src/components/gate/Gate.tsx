"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoMark from "@/components/brand/LogoMark";
import AmbientVideo from "@/components/ui/AmbientVideo";
import Icon from "@/components/ui/Icon";

const GateMap = dynamic(() => import("./GateMap"), { ssr: false });

/**
 * The way in: two halves side by side (stacked on phones). Left, the virtual assistant,
 * Mariam; right, the website on a live map. The half under the pointer widens; choosing
 * the website grows its half over the whole screen, then the home page takes over.
 */
export default function Gate() {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();

  // The chosen half grows over the whole screen, then its page takes over.
  const enter = (e: React.MouseEvent, side: "assistant" | "site", href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    rootRef.current?.setAttribute("data-entering", side);
    window.setTimeout(() => router.push(href), 850);
  };

  return (
    <main ref={rootRef} className="gate fixed inset-0 flex flex-col bg-seu-ink text-white md:flex-row">
      <h1 className="sr-only">SEU Development</h1>
      <div className="pointer-events-none absolute left-8 top-6 z-20 flex items-center gap-2.5 md:left-14 md:top-10" aria-hidden>
        <LogoMark className="h-9 w-auto overflow-visible" />
        <span className="flex flex-col leading-none">
          <span className="label text-[13px] tracking-[0.3em]">SEU</span>
          <span className="text-[11px] text-white/75">Development</span>
        </span>
      </div>

      <div className="gate-pane gate-pane--assistant relative isolate overflow-hidden bg-seu-bg">
        <AmbientVideo name="assistant-loop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="gate-shade pointer-events-none absolute inset-0" aria-hidden />
        <Link href="/assistant/" onClick={(e) => enter(e, "assistant", "/assistant/")} className="group absolute inset-0 z-10 outline-none" aria-labelledby="gate-assistant">
          <div className="gate-copy gate-copy--shaded absolute inset-x-0 bottom-0 z-10 isolate p-8 pb-14 md:p-14">
            <p className="eyebrow text-white">
              Mariam · <span lang="ka">ქართ</span> / EN
            </p>
            <h2 id="gate-assistant" className="page-title mt-6 text-[clamp(40px,5vw,88px)]">
              Virtual
              <br />
              assistant<span className="text-seu-accent-hi">.</span>
            </h2>
            <p className="body-copy mt-5 max-w-sm text-white/85">A video guide in Georgian or English: the projects, apartments and views, and a visit booked for you.</p>
            <span className="btn btn-light btn-lg mt-8 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-white">
              Talk to the assistant <Icon name="arrow" size={18} />
            </span>
          </div>
        </Link>
      </div>

      <div className="gate-pane gate-pane--site relative isolate overflow-hidden bg-[#e9e4da]">
        <GateMap />
        <div className="gate-shade pointer-events-none absolute inset-0" aria-hidden />
        {/* The link covers the half; the map stays outside it so its credits are links of their own. */}
        <Link href="/home/" onClick={(e) => enter(e, "site", "/home/")} className="group absolute inset-0 z-10 outline-none" aria-labelledby="gate-site">
          <div className="gate-copy gate-copy--shaded absolute inset-x-0 bottom-0 z-10 isolate p-8 pb-14 md:p-14">
            <p className="eyebrow text-white">SEU Development</p>
            <h2 id="gate-site" className="page-title mt-6 text-[clamp(40px,5vw,88px)]">
              Explore
              <br />
              the website<span className="text-seu-accent-hi">.</span>
            </h2>
            <p className="body-copy mt-5 max-w-sm text-white/85">Projects, apartments and the visual search, on a live map of Tbilisi.</p>
            <span className="btn btn-primary btn-lg mt-8 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-white">
              Enter <Icon name="arrow" size={18} />
            </span>
          </div>
        </Link>
      </div>
    </main>
  );
}
