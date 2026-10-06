"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { ASSISTANT_NAME, LINES, MODELS, REPLIES, UI, type Lang, type Line, type Model, type Reply } from "@/data/assistant";
import LogoMark from "@/components/brand/LogoMark";
import Icon from "@/components/ui/Icon";

const GateMap = dynamic(() => import("@/components/gate/GateMap"), { ssr: false });

type Scene = "door" | "entry" | "greet" | "showroom" | "zoom" | "project";
type Message = { from: "mariam" | "you"; text: Line };

// The showroom frame; hotspots are placed in percent of it.
const RATIO = 5504 / 3072;

/**
 * The assistant's showroom, stage 1: walk in, Mariam greets you, click a model, the camera
 * dives into it and the live map takes over; from there the website's visual search. Every
 * button, hotspot and (later) AI answer goes through `act`, so they all play the same way.
 */
export default function AssistantExperience() {
  const [lang, setLang] = useState<Lang>("ka");
  const [scene, setScene] = useState<Scene>("door");
  const [line, setLine] = useState<Line>(LINES.greet);
  const [model, setModel] = useState<Model | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0, left: 0, top: 0 });
  const still = useRef(false);
  const t = (l: Line) => l[lang];

  // Cover the viewport with the showroom frame, centred on what matters (the central model).
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Phones get a larger frame so the models can sit above the dialogue.
      const w = Math.max(vw, vh * RATIO * (vw < 768 ? 1.3 : 1));
      const h = w / RATIO;
      const fx = (model?.at.x ?? 50) / 100;
      const fy = (model?.at.y ?? 52) / 100;
      // On phones the dialogue takes the lower half: lift the models into the upper third.
      const top = vw < 768 ? Math.min(0, Math.max(vh - h, vh * 0.3 - fy * h)) : (vh - h) / 2;
      setBox({ w, h, left: Math.min(0, Math.max(vw - w, vw / 2 - fx * w)), top });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [model]);

  const say = useCallback((text: Line) => {
    setLine(text);
    setMessages((m) => [...m, { from: "mariam", text }]);
  }, []);

  const goToModel = useCallback(
    (m: Model) => {
      setModel(m);
      setScene("zoom");
      say(m.project === "varketili" ? LINES.varketili : LINES.finished);
      window.setTimeout(() => setScene("project"), still.current ? 0 : 1900);
    },
    [say],
  );

  // One entry point for replies, hotspots and, in stage 2, the AI's tool calls.
  const act = (reply: Reply["id"]) => {
    const r = REPLIES.find((x) => x.id === reply);
    if (r) setMessages((m) => [...m, { from: "you", text: r.label }]);
    if (reply === "projects") {
      setScene("showroom");
      say(LINES.showroom);
    } else if (reply === "buy") {
      say(LINES.buy);
      window.setTimeout(() => goToModel(MODELS.find((m) => m.id === "varketili")!), still.current ? 0 : 2200);
    } else if (reply === "prices") say(LINES.prices);
    else if (reply === "visit") say(LINES.visit);
    else if (reply === "varketili") goToModel(MODELS.find((m) => m.id === "varketili")!);
  };

  const enter = () => {
    setMessages([{ from: "mariam", text: LINES.greet }]);
    setLine(LINES.greet);
    setScene(still.current ? "showroom" : "entry");
  };

  const backToShowroom = () => {
    setModel(null);
    setScene("showroom");
    say(LINES.showroom);
  };

  const toGreet = useCallback(() => setScene("greet"), []);
  const toShowroom = useCallback(() => setScene("showroom"), []);

  const inShowroom = scene === "greet" || scene === "showroom" || scene === "zoom";
  const zoomOrigin = model ? `${model.at.x}% ${model.at.y}%` : "50% 50%";

  return (
    <main lang={lang} className="tone-dark fixed inset-0 overflow-hidden bg-seu-ink text-white">
      {/* Door: the first frame of the walk-in. */}
      {scene === "door" && (
        <div className="absolute inset-0">
          <img src={withBase("/assistant/door.jpg")} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-seu-ink/80 via-seu-ink/10 to-seu-ink/40" />
        </div>
      )}

      {/* Showroom stage: the frame, the clips over it and the model hotspots move together. */}
      {(scene === "entry" || inShowroom) && (
        <div
          className="absolute overflow-hidden"
          style={{
            width: box.w,
            height: box.h,
            left: box.left,
            top: box.top,
            transformOrigin: zoomOrigin,
            transform: scene === "zoom" ? "scale(2.8)" : "scale(1)",
            transition: still.current ? "none" : "transform 1.8s cubic-bezier(0.7, 0, 0.2, 1), left 0.8s ease",
          }}
        >
          <img src={withBase("/assistant/showroom.jpg")} alt={lang === "ka" ? "შოურუმი მაკეტებით" : "Showroom with scale models"} className="absolute inset-0 h-full w-full object-cover" />
          {scene === "entry" && <Clip name="entry" onEnd={toGreet} />}
          {scene === "greet" && <Clip name="greet" onEnd={toShowroom} />}
          {(scene === "showroom" || scene === "greet") &&
            MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => goToModel(m)}
                className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${m.at.x}%`, top: `${m.at.y}%` }}
              >
                <span className="relative grid h-12 w-12 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/40" aria-hidden />
                  <span className="relative h-4 w-4 rounded-full border-2 border-white bg-seu-accent shadow-lg group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-white" />
                </span>
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-seu-ink/80 px-3 py-1.5 text-[12px] font-semibold tracking-wide backdrop-blur transition group-hover:bg-seu-accent">
                  {t(m.name)}
                </span>
              </button>
            ))}
        </div>
      )}

      {/* Zoom lands on the model close-up, then the live map of the site. */}
      {scene === "zoom" && model?.closeup && (
        <img src={withBase(model.closeup)} alt="" className="assistant-fade-in absolute inset-0 h-full w-full object-cover" />
      )}
      {scene === "project" && model && (
        <div className="assistant-fade-in absolute inset-0">
          <GateMap project={model.project} zoom={15.6} />
          <div className="gate-shade--side pointer-events-none absolute inset-0" aria-hidden />
        </div>
      )}

      {/* Top bar: back to the gate, logo, language, the website. */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 md:p-8">
        <Link href="/" className="btn btn-glass btn-sm">
          <Icon name="arrow" size={16} className="rotate-180" /> {t(UI.back)}
        </Link>
        <span className="pointer-events-none hidden items-center gap-2.5 sm:flex" aria-hidden>
          <LogoMark className="h-8 w-auto overflow-visible" />
          <span className="label text-[12px] tracking-[0.3em]">SEU</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="segmented ctl-sm border-white/40 bg-seu-ink/50 backdrop-blur" role="group" aria-label="Language / ენა">
            {(["ka", "en"] as const).map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)} className="text-white">
                {l === "ka" ? "ქარ" : "EN"}
              </button>
            ))}
          </div>
          <Link href="/home/" className="btn btn-glass btn-sm hidden md:inline-flex">
            {t(UI.site)}
          </Link>
        </div>
      </header>

      {/* Door: one call to action. */}
      {scene === "door" && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center p-8 pb-14 text-center">
          <p className="eyebrow text-white">SEU Development · {t(ASSISTANT_NAME)}</p>
          <button type="button" onClick={enter} className="btn btn-primary btn-lg mt-6" autoFocus>
            {t(UI.enter)} <Icon name="arrow" size={18} />
          </button>
        </div>
      )}

      {(scene === "entry" || scene === "greet") && (
        <button type="button" onClick={() => setScene("showroom")} className="btn btn-glass btn-sm absolute right-4 top-20 z-20 md:right-8 md:top-28">
          {t(UI.skip)}
        </button>
      )}

      {/* Mariam's words and the choices; the same panel in every scene after the door. */}
      {scene !== "door" && scene !== "entry" && (
        <section aria-live="polite" className="glass glass-dark absolute bottom-4 left-4 right-4 z-20 max-h-[48svh] overflow-y-auto rounded-[22px] p-4 md:bottom-8 md:left-8 md:right-auto md:max-h-none md:w-[min(560px,46vw)] md:p-5" data-lenis-prevent>
          <div className="flex items-start gap-4">
            <img src={withBase("/media/assistant-loop.jpg")} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/30" />
            <div className="min-w-0">
              <p className="label text-[12px] uppercase tracking-[0.16em] text-white/80">{t(ASSISTANT_NAME)}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-white md:text-[15px]">{t(line)}</p>
            </div>
          </div>
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {scene === "project" && model ? (
              <>
                <Link href={model.href} className="btn btn-primary btn-sm shrink-0">
                  {model.project === "varketili" ? t(UI.openSearch) : t(UI.openProject)} <Icon name="arrow" size={14} />
                </Link>
                <button type="button" onClick={backToShowroom} className="btn btn-glass btn-sm shrink-0">
                  {t(UI.toShowroom)}
                </button>
              </>
            ) : (
              <>
                {REPLIES.map((r) => (
                  <button key={r.id} type="button" onClick={() => act(r.id)} className="btn btn-glass btn-sm shrink-0 normal-case tracking-normal">
                    {t(r.label)}
                  </button>
                ))}
                {line === LINES.visit && (
                  <Link href="/contact/" className="btn btn-primary btn-sm">
                    <Icon name="phone" size={14} /> {t(UI.call)}
                  </Link>
                )}
              </>
            )}
          </div>
          {/* The models as a list too: for keyboards, screen readers and narrow screens. */}
          {(scene === "showroom" || scene === "greet") && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/15 pt-3 text-[13px]">
              <span className="text-white/75">{t(UI.models)}:</span>
              {MODELS.map((m) => (
                <button key={m.id} type="button" onClick={() => goToModel(m)} className="rounded-full px-2 py-1 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  {t(m.name)}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Dialogue: the conversation so far; free questions arrive with the AI (stage 2). */}
      {scene !== "door" && scene !== "entry" && (
        <>
          <button
            type="button"
            aria-expanded={chatOpen}
            aria-controls="assistant-chat"
            onClick={() => setChatOpen((o) => !o)}
            className="btn btn-light btn-sm absolute bottom-4 right-4 z-30 hidden md:inline-flex md:bottom-8 md:right-8"
          >
            {t(UI.chat)}
          </button>
          {chatOpen && (
            <aside id="assistant-chat" aria-label={t(UI.chat)} className="glass glass-dark absolute bottom-24 right-8 top-28 z-30 hidden w-[380px] flex-col rounded-[22px] p-5 md:flex">
              <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
                {messages.map((m, i) => (
                  <li key={i} className={`max-w-[85%] rounded-[16px] px-4 py-3 text-[14px] leading-relaxed ${m.from === "you" ? "ml-auto bg-seu-accent text-white" : "bg-white/10 text-white"}`}>
                    {t(m.text)}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[13px] text-white/75">{t(UI.chatSoon)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {REPLIES.map((r) => (
                  <button key={r.id} type="button" onClick={() => act(r.id)} className="chip ctl-sm rounded-full border-white/40 px-3 text-[12px] text-white">
                    {t(r.label)}
                  </button>
                ))}
              </div>
              <input disabled placeholder={t(UI.chatSoon)} aria-label={t(UI.chat)} className="field ctl-sm mt-3 cursor-not-allowed opacity-60" />
            </aside>
          )}
        </>
      )}
    </main>
  );
}

/** A one-off clip over the showroom frame (walk-in, greeting). Missing or blocked: skip it. */
function Clip({ name, onEnd }: { name: string; onEnd: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    ref.current?.play().catch(() => onEnd());
  }, [onEnd]);
  return (
    <video ref={ref} muted playsInline preload="auto" onEnded={onEnd} aria-hidden className="absolute inset-0 h-full w-full object-cover">
      <source src={withBase(`/assistant/${name}.webm`)} type="video/webm" />
      <source src={withBase(`/assistant/${name}.mp4`)} type="video/mp4" onError={onEnd} />
    </video>
  );
}
