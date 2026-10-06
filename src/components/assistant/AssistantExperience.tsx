"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { blockById, unitsOn, varketiliBlocks } from "@/data/inventory";
import { ASSISTANT_NAME, FACADES, LINES, MAQUETTE, MODELS, REPLIES, UI, type Lang, type Line, type Model, type Reply } from "@/data/assistant";
import LogoMark from "@/components/brand/LogoMark";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import AssistantFloorDrawer from "./AssistantFloorDrawer";

type Scene = "door" | "entry" | "greet" | "showroom" | "zoom" | "block" | "finished";
type Message = { from: "mariam" | "you"; text: Line };
type Pick = { block: string; floor: number };

// Showroom and model close-up share one frame size; hotspots and floors sit in percent of it.
const RATIO = 5504 / 3072;

/**
 * The assistant's showroom, stage 1, self-contained: walk in, Mariam greets you, click a model,
 * the camera dives into it, you point at a floor on the model, and its plan and apartments
 * open in a drawer. Every button, hotspot and (later) AI answer goes through `act`, so they
 * all play the same way.
 */
export default function AssistantExperience() {
  const [lang, setLang] = useState<Lang>("ka");
  const [scene, setScene] = useState<Scene>("door");
  const [line, setLine] = useState<Line>(LINES.greet);
  const [model, setModel] = useState<Model | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [hover, setHover] = useState<(Pick & { x: number; y: number }) | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [callSent, setCallSent] = useState(false);
  const [formBlock, setFormBlock] = useState("v7");
  const [formFloor, setFormFloor] = useState("8");
  const [box, setBox] = useState({ w: 0, h: 0, left: 0, top: 0 });
  const still = useRef(false);
  const t = (l: Line) => l[lang];

  // Cover the viewport with the frame, centred on what matters.
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const phone = vw < 768;
      const onModel = scene === "block";
      // On a phone the whole model fits across the screen, above the dialogue.
      if (phone && onModel) {
        const w = vw / 0.56;
        setBox({ w, h: w / RATIO, left: vw / 2 - 0.47 * w, top: Math.max(64, vh * 0.22 - 0.28 * (w / RATIO)) });
        return;
      }
      // Phones get a larger frame so the models can sit above the dialogue.
      const w = Math.max(vw, vh * RATIO * (phone ? 1.3 : 1));
      const h = w / RATIO;
      const fx = onModel ? 0.47 : (model?.at.x ?? 50) / 100;
      const fy = onModel ? 0.55 : (model?.at.y ?? 52) / 100;
      const top = phone ? Math.min(0, Math.max(vh - h, vh * 0.3 - fy * h)) : (vh - h) / 2;
      setBox({ w, h, left: Math.min(0, Math.max(vw - w, vw / 2 - fx * w)), top });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [model, scene]);

  const say = useCallback((text: Line) => {
    setLine(text);
    setMessages((m) => [...m, { from: "mariam", text }]);
  }, []);

  const goToModel = useCallback(
    (m: Model) => {
      setModel(m);
      setScene("zoom");
      const varketili = m.project === "varketili";
      say(varketili ? LINES.varketili : LINES.finished);
      window.setTimeout(() => setScene(varketili ? "block" : "finished"), still.current ? 0 : 1900);
    },
    [say],
  );

  const varketili = MODELS.find((m) => m.id === "varketili")!;

  const openFloor = useCallback(
    (p: Pick) => {
      setPick(p);
      setHover(null);
      say(LINES.floor);
    },
    [say],
  );

  // One entry point for replies, hotspots and, in stage 2, the AI's tool calls.
  const act = (reply: Reply["id"]) => {
    const r = REPLIES.find((x) => x.id === reply);
    if (r) setMessages((m) => [...m, { from: "you", text: r.label }]);
    if (reply === "projects") {
      setModel(null);
      setScene("showroom");
      say(LINES.showroom);
    } else if (reply === "buy") {
      say(LINES.buy);
      window.setTimeout(() => goToModel(varketili), still.current ? 0 : 2200);
    } else if (reply === "prices") say(LINES.prices);
    else if (reply === "visit") say(LINES.visit);
    else if (reply === "varketili") goToModel(varketili);
  };

  const enter = () => {
    setMessages([{ from: "mariam", text: LINES.greet }]);
    setLine(LINES.greet);
    setScene(still.current ? "showroom" : "entry");
  };

  const backToShowroom = () => {
    setModel(null);
    setPick(null);
    setScene("showroom");
    say(LINES.showroom);
  };

  const toGreet = useCallback(() => setScene("greet"), []);
  const toShowroom = useCallback(() => setScene("showroom"), []);
  const closeDrawer = useCallback(() => setPick(null), []);

  const inShowroom = scene === "greet" || scene === "showroom" || scene === "zoom" || scene === "finished";
  const zoomed = scene === "zoom" || scene === "finished";
  const zoomOrigin = model ? `${model.at.x}% ${model.at.y}%` : "50% 50%";
  const hoverBlock = hover ? blockById(hover.block) : null;
  const hoverFlats = hover ? unitsOn(hover.block, hover.floor) : [];
  const formFloors = Array.from({ length: (blockById(formBlock)?.floors ?? 12) - 1 }, (_, i) => String(i + 2));

  const frame = { width: box.w, height: box.h, left: box.left, top: box.top };

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
            ...frame,
            transformOrigin: zoomOrigin,
            transform: zoomed ? "scale(2.8)" : "scale(1)",
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

      {/* The zoom lands on the model close-up; there you point at a floor on the model itself. */}
      {scene === "zoom" && model?.closeup && <img src={withBase(model.closeup)} alt="" className="assistant-fade-in absolute inset-0 h-full w-full object-cover" />}
      {scene === "block" && (
        <img src={withBase(MAQUETTE)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl md:hidden" />
      )}
      {scene === "block" && (
        <div className="absolute" style={frame} onPointerLeave={() => setHover(null)}>
          <img src={withBase(MAQUETTE)} alt={lang === "ka" ? "SEU ვარკეთილის მაკეტი" : "Scale model of SEU Varketili"} className="absolute inset-0 h-full w-full object-cover" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" data-cursor="native">
            {FACADES.map((f) => {
              const b = blockById(f.block);
              if (!b) return null;
              const step = (f.y[1] - f.y[0]) / b.floors;
              return Array.from({ length: b.floors - 1 }, (_, i) => {
                const floor = i + 2;
                const y = f.y[1] - floor * step;
                const on = hover?.block === f.block && hover.floor === floor;
                return (
                  <rect
                    key={`${f.block}-${floor}`}
                    x={f.x[0]}
                    y={y}
                    width={f.x[1] - f.x[0]}
                    height={step}
                    fill="#e07a3a"
                    fillOpacity={on ? 0.55 : hover?.block === f.block ? 0.08 : 0}
                    className="cursor-pointer outline-none"
                    onPointerMove={(e) => setHover({ block: f.block, floor, x: e.clientX, y: e.clientY })}
                    onClick={() => openFloor({ block: f.block, floor })}
                    aria-hidden
                  />
                );
              });
            })}
          </svg>
          {FACADES.map((f) => (
            <span
              key={f.block}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-full bg-seu-ink/80 px-2.5 py-1 text-[12px] font-semibold backdrop-blur sm:px-3"
              style={{ left: `${(f.x[0] + f.x[1]) / 2}%`, top: `${f.y[0] - 1}%` }}
              aria-hidden
            >
              <span className="hidden sm:inline">{t(UI.block)} </span>
              {f.block.slice(1)}
            </span>
          ))}
        </div>
      )}
      {scene === "block" && hover && hoverBlock && (
        <div className="pointer-events-none fixed z-30 rounded-[14px] bg-seu-ink/90 px-4 py-3 text-[13px] shadow-xl backdrop-blur" style={{ left: hover.x + 18, top: hover.y + 18 }}>
          <p className="title-m text-[18px]">
            {t(UI.floor)} {hover.floor}
          </p>
          <p className="text-white/80">
            {t(UI.block)} {hover.block.slice(1)} ·{" "}
            {lang === "ka"
              ? `${hoverFlats.length}-დან ${hoverFlats.filter((u) => u.status === "available").length} თავისუფალი`
              : `${hoverFlats.filter((u) => u.status === "available").length} of ${hoverFlats.length} available`}
          </p>
        </div>
      )}

      {/* Top bar: back to the gate, logo, language. */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 md:p-8">
        <Link href="/" className="btn btn-glass btn-sm">
          <Icon name="arrow" size={16} className="rotate-180" /> {t(UI.back)}
        </Link>
        <span className="pointer-events-none hidden items-center gap-2.5 sm:flex" aria-hidden>
          <LogoMark className="h-8 w-auto overflow-visible" />
          <span className="label text-[12px] tracking-[0.3em]">SEU</span>
        </span>
        <div className="segmented ctl-sm border-white/40 bg-seu-ink/50 backdrop-blur" role="group" aria-label="Language / ენა">
          {(["ka", "en"] as const).map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)} className="text-white">
              {l === "ka" ? "ქარ" : "EN"}
            </button>
          ))}
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
            {scene === "block" || scene === "finished" ? (
              <>
                {scene === "finished" && (
                  <button type="button" onClick={() => goToModel(varketili)} className="btn btn-primary btn-sm shrink-0">
                    {t(UI.showVarketili)} <Icon name="arrow" size={14} />
                  </button>
                )}
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
              </>
            )}
          </div>
          {/* A visit is booked right here: Mariam takes the number, nothing leaves the showroom. */}
          {line === LINES.visit &&
            (callSent ? (
              <p role="status" className="mt-3 border-t border-white/15 pt-3 text-[14px] font-semibold text-white">
                {t(UI.thanks)}
              </p>
            ) : (
              <form
                className="mt-3 grid grid-cols-1 items-end gap-3 border-t border-white/15 pt-3 sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCallSent(true);
                }}
              >
                <label className="block">
                  <span className="field-label text-white/85">{t(UI.name)}</span>
                  <input name="name" autoComplete="name" className="field" />
                </label>
                <label className="block">
                  <span className="field-label text-white/85">
                    {t(UI.phone)}
                    <span aria-hidden> *</span>
                  </span>
                  <input name="phone" type="tel" required autoComplete="tel" className="field" />
                </label>
                <button type="submit" className="btn btn-primary">
                  <Icon name="phone" size={16} /> {t(UI.call)}
                </button>
              </form>
            ))}
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
          {/* Floors as a form too: the same choice without pointing at the model. */}
          {scene === "block" && (
            <form
              className="mt-3 grid grid-cols-2 items-end gap-3 border-t border-white/15 pt-3 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                openFloor({ block: formBlock, floor: Number(formFloor) });
              }}
            >
              <Select
                label={t(UI.block)}
                value={formBlock}
                options={varketiliBlocks.map((b) => ({ value: b.id, label: `${t(UI.block)} ${b.id.slice(1)}` }))}
                onChange={(v) => {
                  setFormBlock(v);
                  setFormFloor("2");
                }}
              />
              <Select label={t(UI.floor)} value={formFloor} options={formFloors.map((f) => ({ value: f, label: f }))} onChange={setFormFloor} />
              <button type="submit" className="btn btn-primary col-span-2 sm:col-span-1">
                {t(UI.showPlan)}
              </button>
            </form>
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

      <AssistantFloorDrawer pick={pick} lang={lang} onClose={closeDrawer} />
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
