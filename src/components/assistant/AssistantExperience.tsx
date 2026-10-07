"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { withBase } from "@/data/projects";
import { blockById, unitById, unitsOn, varketiliBlocks } from "@/data/inventory";
import VOICE from "@/data/voice.json";
import { ASSISTANT_NAME, FACADES, facadeFloors, facadeLabel, lineId, LINES, MAQUETTE, MODELS, REPLIES, SYNCED_GREETING, UI, VIEW, type Lang, type Line, type Model, type Reply } from "@/data/assistant";
import { questionLang, SUGGESTIONS, templateEngine, type ChatAct, type ChatEngine, type ChatReply, type SuggestionId } from "@/data/chat";
import { langOf, localize } from "@/lib/i18n";
import LogoMark from "@/components/brand/LogoMark";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import AssistantFloorDrawer from "./AssistantFloorDrawer";

type Scene = "door" | "entry" | "greet" | "showroom" | "zoom" | "block" | "finished";
type Message = { from: "mariam" | "you"; text?: Line; units?: string[]; suggest?: SuggestionId[] };
type Pick = { block: string; floor: number; unit?: string };

// Showroom and model close-up share one frame size; hotspots and floors sit in percent of it.
const RATIO = 5504 / 3072;
const floorShapes = facadeFloors((block) => blockById(block)?.floors ?? 12);

const REDUCE = "(prefers-reduced-motion: reduce)";
const onMotionPref = (change: () => void) => {
  const q = window.matchMedia(REDUCE);
  q.addEventListener("change", change);
  return () => q.removeEventListener("change", change);
};

/**
 * The assistant's showroom, self-contained: walk in, Mariam greets you, click a model, the
 * camera dives into it, you point at a floor on the model, and its plan and apartments open in
 * a drawer; a finished project plays its presentation film. Buttons, hotspots and chat answers
 * all go through `perform`, so they play the same way. The language is the path's (/assistant/
 * Georgian, /en/assistant/ English); switching rewrites the address without leaving the room.
 * The chat answers through `engine`: the templates today, an AI later (see data/chat.ts).
 */
export default function AssistantExperience({ engine = templateEngine }: { engine?: ChatEngine }) {
  const pathname = usePathname();
  const lang: Lang = langOf(pathname);
  const setLang = (l: Lang) => {
    if (l !== lang) window.history.replaceState(null, "", withBase(localize(pathname, l)));
  };
  const [offer, setOffer] = useState<ChatAct | undefined>(undefined);
  const [filmEnded, setFilmEnded] = useState(false);
  const [scene, setScene] = useState<Scene>("door");
  const [line, setLine] = useState<Line>(LINES.greet);
  const [model, setModel] = useState<Model | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [withForm, setWithForm] = useState(false);
  const chatEnd = useRef<HTMLLIElement>(null);
  const [hover, setHover] = useState<(Pick & { x: number; y: number }) | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [callSent, setCallSent] = useState(false);
  const [formBlock, setFormBlock] = useState("v7");
  const [formFloor, setFormFloor] = useState("8");
  const [box, setBox] = useState({ w: 0, h: 0, left: 0, top: 0 });
  const [soundOn, setSoundOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [said, setSaid] = useState(0);
  const voice = useRef<HTMLAudioElement | null>(null);
  const still = useRef(false);
  const t = (l: Line) => l[lang];
  // Read in render for the zoom's transition; `still` mirrors it for timers and handlers.
  const reduced = useSyncExternalStore(onMotionPref, () => window.matchMedia(REDUCE).matches, () => false);

  // Cover the viewport with the frame, centred on what matters.
  useEffect(() => {
    still.current = window.matchMedia(REDUCE).matches;
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

  const say = useCallback((text: Line, form = text === LINES.visit) => {
    setLine(text);
    setWithForm(form);
    setSaid((n) => n + 1);
    setMessages((m) => [...m, { from: "mariam", text }]);
  }, []);

  // Mariam's voice: each line plays its recording once, in the chosen language; lines not yet
  // recorded stay silent and the subtitles carry them. Nothing plays before the visitor walks in.
  const quiet = scene === "door" || scene === "entry";
  useEffect(() => {
    const a = voice.current;
    if (!a) return;
    a.pause();
    const id = lineId(line);
    const key = id && `${id}-${lang}`;
    // Pausing fires the element's "pause" event, which clears the speaking marker.
    if (!soundOn || quiet || !key || !(key in VOICE)) return;
    a.src = withBase(`/assistant/voice/${key}.mp3`);
    a.play().catch(() => setSpeaking(false));
    // `line` is read here but `said` decides when a line is spoken (the same line can be said twice).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [said, lang, soundOn, quiet]);
  useEffect(() => () => voice.current?.pause(), []);

  const toggleSound = () => {
    setSoundOn((on) => {
      try {
        localStorage.setItem("seu-voice", on ? "off" : "on");
      } catch {}
      return !on;
    });
  };

  /** Run `next` once Mariam has finished the line she is saying, or after `fallback` ms if she is silent. */
  const afterSpeech = useCallback((next: () => void, fallback: number) => {
    window.setTimeout(() => {
      const a = voice.current;
      if (a && !a.paused && !a.ended) {
        const done = () => {
          a.removeEventListener("ended", done);
          a.removeEventListener("pause", done);
          window.setTimeout(next, 400);
        };
        a.addEventListener("ended", done);
        a.addEventListener("pause", done);
      } else window.setTimeout(next, Math.max(0, fallback - 150));
    }, 150);
  }, []);

  const goToModel = useCallback(
    (m: Model) => {
      setModel(m);
      setScene("zoom");
      const varketili = m.project === "varketili";
      setFilmEnded(false);
      say(varketili ? LINES.varketili : LINES.done);
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

  /** A floor (and maybe one of its apartments) on the Varketili model, flying there first if needed. */
  const showFloor = (p: Pick) => {
    setFormBlock(p.block);
    setFormFloor(String(p.floor));
    if (window.innerWidth < 768) setChatOpen(false);
    if (scene === "block") openFloor(p);
    else {
      goToModel(varketili);
      window.setTimeout(() => openFloor(p), still.current ? 0 : 2100);
    }
  };

  // One entry point for replies, hotspots and chat answers (and, later, an AI's tool calls).
  const perform = (a: ChatAct) => {
    if (a.type === "floor") return showFloor({ block: a.block, floor: a.floor });
    if (a.type === "unit") {
      const u = unitById(a.id);
      return u && showFloor({ block: u.block, floor: u.floor, unit: u.id });
    }
    if (a.to === "projects") {
      setModel(null);
      setScene("showroom");
      say(LINES.showroom);
    } else if (a.to === "buy") {
      say(LINES.buy);
      afterSpeech(() => goToModel(varketili), still.current ? 0 : 2200);
    } else if (a.to === "visit") say(LINES.visit);
    else goToModel(MODELS.find((m) => m.id === a.to) ?? varketili);
  };
  const act = (reply: Reply["id"]) => {
    const r = REPLIES.find((x) => x.id === reply);
    if (r) setMessages((m) => [...m, { from: "you", text: r.label }]);
    perform({ type: "scene", to: reply });
  };

  /** Mariam's answer: her words in the chat (spoken when recorded), then what it shows. */
  const answer = (r: ChatReply) => {
    setOffer(r.offer);
    if (r.text && !r.act) say(r.text, !!r.form);
    else if (r.text) setMessages((m) => [...m, { from: "mariam", text: r.text }]);
    if (r.units?.length || r.suggest?.length) setMessages((m) => [...m, { from: "mariam", units: r.units, suggest: r.suggest }]);
    if (r.act) perform(r.act);
  };

  // A question, typed or from a chip: Mariam answers in the language it was asked in, after a short pause.
  const askText = async (q: string) => {
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "you", text: { ka: q, en: q } }]);
    const asked = questionLang(q);
    const replyLang = asked ?? lang;
    if (replyLang !== lang) setLang(replyLang);
    setTyping(true);
    let r: ChatReply;
    try {
      r = await engine.reply(q, { lang: replyLang, offer });
    } catch {
      r = { form: true, text: { ka: "ბოდიში, ახლა ვერ გიპასუხებთ. დატოვეთ ნომერი და გადმოგირეკავთ.", en: "Sorry, I can't answer right now. Leave your number and we will call you back." } };
    }
    window.setTimeout(
      () => {
        setTyping(false);
        answer(r);
      },
      still.current ? 0 : 700,
    );
  };
  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    setDraft("");
    askText(q);
  };

  // The newest message stays in view.
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "end", behavior: still.current ? "auto" : "smooth" });
  }, [messages, typing, chatOpen]);

  const enter = () => {
    // Browsers allow sound only after a click: this click opens Mariam's audio for the visit.
    if (!voice.current) {
      try {
        if (localStorage.getItem("seu-voice") === "off") setSoundOn(false);
      } catch {}
      const a = new Audio();
      a.preload = "auto";
      a.addEventListener("playing", () => setSpeaking(true));
      a.addEventListener("pause", () => setSpeaking(false));
      a.addEventListener("ended", () => setSpeaking(false));
      a.muted = true;
      a.src = withBase("/assistant/voice/greet-ka.mp3");
      a.play()
        .then(() => a.pause())
        .catch(() => {})
        .finally(() => (a.muted = false));
      voice.current = a;
    }
    setMessages([{ from: "mariam", text: LINES.greet }]);
    setLine(LINES.greet);
    setSaid((n) => n + 1);
    setScene(still.current ? "showroom" : "entry");
  };

  const backToShowroom = () => {
    setOffer(undefined);
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
  // The zoom also brings the model toward the middle of the screen (higher on phones, above the
  // dialogue), never so far that the frame's edge comes into view.
  const zoom = (() => {
    if (!model || typeof window === "undefined") return { scale: 2.8, shift: "" };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const phone = vw < 768;
    const k = phone ? 2 : 2.8;
    const ox = (model.at.x / 100) * box.w;
    const oy = (model.at.y / 100) * box.h;
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const dx = clamp(vw * 0.5 - (box.left + ox), vw - box.left - ox - k * (box.w - ox), k * ox - box.left - ox);
    const dy = clamp(vh * (phone ? 0.3 : 0.42) - (box.top + oy), vh - box.top - oy - k * (box.h - oy), k * oy - box.top - oy);
    return { scale: k, shift: `translate(${dx}px, ${dy}px) ` };
  })();

  const hoverBlock = hover ? blockById(hover.block) : null;
  const hoverFlats = hover ? unitsOn(hover.block, hover.floor) : [];
  const formFloors = Array.from({ length: (blockById(formBlock)?.floors ?? 12) - 1 }, (_, i) => String(i + 2));

  const frame = { width: box.w, height: box.h, left: box.left, top: box.top };

  // A visit is booked right here: Mariam takes the number, nothing leaves the showroom.
  const callForm = (inChat = false) =>
    callSent ? (
      <p role="status" className={`text-[14px] font-semibold text-white ${inChat ? "rounded-[16px] bg-white/10 px-4 py-3" : "mt-3 border-t border-white/15 pt-3"}`}>
        {t(UI.thanks)}
      </p>
    ) : (
      <form
        className={`grid grid-cols-1 items-end gap-3 ${inChat ? "rounded-[16px] bg-white/10 p-4" : "mt-3 border-t border-white/15 pt-3 sm:grid-cols-[1fr_1fr_auto]"}`}
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
    );

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
            transform: zoomed ? `${zoom.shift}scale(${zoom.scale})` : "scale(1)",
            transition: reduced ? "none" : "transform 1.8s cubic-bezier(0.7, 0, 0.2, 1), left 0.8s ease",
          }}
        >
          <img src={withBase("/assistant/showroom.jpg")} alt={lang === "ka" ? "შოურუმი მაკეტებით" : "Showroom with scale models"} className="absolute inset-0 h-full w-full object-cover" />
          {scene === "entry" && <Clip name="entry" onEnd={toGreet} />}
          {scene === "greet" && <Clip name={SYNCED_GREETING[lang] ?? "greet"} onEnd={toShowroom} />}
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
      {/* A finished project: the zoom lands in its presentation film, with the facts beside it. */}
      {scene === "finished" && model?.film && (
        <div className="assistant-fade-in absolute inset-0 bg-seu-ink">
          <video
            key={`${model.id}-${filmEnded}`}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={withBase(`${model.film}.jpg`)}
            onEnded={() => setFilmEnded(true)}
            aria-label={`${t(UI.film)}: ${t(model.name)}`}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={withBase(`${model.film}.webm`)} type="video/webm" />
            <source src={withBase(`${model.film}.mp4`)} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-seu-ink/60 via-transparent to-seu-ink/70" />
          {model.facts && (
            <div className="glass glass-dark absolute right-4 top-36 z-10 max-w-[min(360px,calc(100vw-2rem))] rounded-[22px] p-5 md:right-8 md:top-28">
              <p className="eyebrow text-white">
                {t(UI.finishedIn)} · {model.facts.year}
              </p>
              <h2 className="title-m mt-3 text-[clamp(24px,2.4vw,34px)]">{t(model.name)}</h2>
              <p className="mt-2 text-[14px] text-white/85">{t(model.facts.address)}</p>
              <p className="mt-1 text-[14px] text-white/85">
                {model.facts.floors} {t(UI.floorsCount)}
              </p>
            </div>
          )}
        </div>
      )}
      {scene === "block" && (
        <img src={withBase(MAQUETTE)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl md:hidden" />
      )}
      {scene === "block" && (
        <div className="absolute" style={frame} onPointerLeave={() => setHover(null)}>
          <img src={withBase(MAQUETTE)} alt={lang === "ka" ? "SEU ვარკეთილის მაკეტი" : "Scale model of SEU Varketili"} className="absolute inset-0 h-full w-full object-cover" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" data-cursor="native">
            {floorShapes.map((f, i) => {
              const on = hover?.block === f.block && hover.floor === f.floor;
              return (
                <polygon
                  key={i}
                  points={f.points.map((pt) => pt.join(",")).join(" ")}
                  fill="#e07a3a"
                  stroke="#fff"
                  strokeWidth={on ? 1.5 : 0}
                  vectorEffect="non-scaling-stroke"
                  fillOpacity={on ? 0.5 : hover?.block === f.block ? 0.1 : 0}
                  className="cursor-pointer outline-none"
                  onPointerMove={(e) => setHover({ block: f.block, floor: f.floor, x: e.clientX, y: e.clientY })}
                  onClick={() => openFloor({ block: f.block, floor: f.floor })}
                  aria-hidden
                />
              );
            })}
          </svg>
          {FACADES.map((f) => (
            <span
              key={f.block}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-full bg-seu-ink/80 px-2.5 py-1 text-[12px] font-semibold backdrop-blur sm:px-3"
              style={{ left: `${facadeLabel(f).x}%`, top: `${facadeLabel(f).y}%` }}
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
        <Link href={localize("/", lang)} className="btn btn-glass btn-sm">
          <Icon name="arrow" size={16} className="rotate-180" /> {t(UI.back)}
        </Link>
        <span className="pointer-events-none hidden items-center gap-2.5 sm:flex" aria-hidden>
          <LogoMark className="h-8 w-auto overflow-visible" />
          <span className="label text-[12px] tracking-[0.3em]">SEU</span>
        </span>
        <div className="flex items-center gap-2">
          <button type="button" aria-pressed={soundOn} aria-label={t(UI.sound)} title={t(UI.sound)} onClick={toggleSound} className="btn btn-glass btn-sm w-10 px-0">
            <Icon name={soundOn ? "volume" : "mute"} size={18} />
          </button>
          <div className="segmented ctl-sm border-white/40 bg-seu-ink/50 backdrop-blur" role="group" aria-label={lang === "ka" ? "ენა" : "Language"}>
            {(["ka", "en"] as const).map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)} className="text-white">
                {l === "ka" ? "ქარ" : "EN"}
              </button>
            ))}
          </div>
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
              <p className="label flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-white/80">
                {t(ASSISTANT_NAME)}
                <span className="speaking" data-on={speaking || undefined} aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-white md:text-[15px]">{t(line)}</p>
            </div>
          </div>
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {scene === "block" || scene === "finished" ? (
              <>
                {scene === "finished" && (
                  <button type="button" onClick={() => setFilmEnded((e) => !e)} className="btn btn-primary btn-sm shrink-0">
                    <Icon name="reset" size={14} /> {t(UI.replay)}
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
          {withForm && !chatOpen && callForm()}
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

      {/* Dialogue: the conversation so far, and free questions typed to Mariam. */}
      {scene !== "door" && scene !== "entry" && (
        <>
          <button
            type="button"
            aria-expanded={chatOpen}
            aria-controls="assistant-chat"
            onClick={() => setChatOpen((o) => !o)}
            className="btn btn-light btn-sm absolute left-4 top-20 z-30 md:bottom-8 md:left-auto md:right-8 md:top-auto"
          >
            <Icon name="chat" size={16} /> {t(UI.chat)}
          </button>
          {chatOpen && (
            <aside
              id="assistant-chat"
              aria-label={t(UI.chat)}
              className="glass glass-dark absolute inset-x-4 bottom-4 top-32 z-40 flex flex-col rounded-[22px] p-4 md:bottom-24 md:left-auto md:right-8 md:top-28 md:w-[380px] md:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="label text-[12px] uppercase tracking-[0.16em] text-white/80">{t(ASSISTANT_NAME)}</p>
                <button type="button" onClick={() => setChatOpen(false)} aria-label={t(UI.chatClose)} className="btn btn-glass btn-sm w-9 px-0">
                  <Icon name="close" size={16} />
                </button>
              </div>
              <ol tabIndex={0} aria-label={t(UI.chat)} className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-[12px] pr-1 outline-none focus-visible:outline-2 focus-visible:outline-white" data-lenis-prevent>
                {messages.map((m, i) =>
                  m.text ? (
                    <li key={i} className={`max-w-[85%] rounded-[16px] px-4 py-3 text-[14px] leading-relaxed ${m.from === "you" ? "ml-auto bg-seu-accent text-white" : "bg-white/10 text-white"}`}>
                      {t(m.text)}
                    </li>
                  ) : (
                    <li key={i} className="space-y-2">
                      {m.units?.map((id) => {
                        const u = unitById(id);
                        if (!u) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => perform({ type: "unit", id })}
                            className="block w-full rounded-[16px] border border-white/15 bg-white/5 px-4 py-3 text-left text-[13px] transition hover:border-white/40 hover:bg-white/10"
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="title-m text-[18px]">
                                {t(UI.apartment)} {u.number}
                              </span>
                              <span className="text-white/75">
                                {t(UI.block)} {u.block.slice(1)} · {t(UI.floor)} {u.floor}
                              </span>
                            </span>
                            <span className="mt-1 block text-white/85">
                              {u.bedrooms === 0 ? t(UI.studio) : `${u.bedrooms} ${t(UI.bedrooms).toLowerCase()}`} · {u.totalArea} {lang === "ka" ? "მ²" : "m²"} · {u.views.map((v) => t(VIEW[v])).join(", ")}
                            </span>
                          </button>
                        );
                      })}
                      {i === messages.length - 1 && m.suggest && (
                        <span className="flex flex-wrap gap-2 pt-1">
                          {m.suggest.map((s) => (
                            <button key={s} type="button" onClick={() => askText(t(SUGGESTIONS[s]))} className="chip ctl-sm rounded-full border-white/40 px-3 text-[12px] text-white">
                              {t(SUGGESTIONS[s])}
                            </button>
                          ))}
                        </span>
                      )}
                    </li>
                  ),
                )}
                {typing && (
                  <li className="w-fit rounded-[16px] bg-white/10 px-4 py-3 text-[13px] text-white/80">
                    <span className="speaking mr-2" data-on aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                    {t(UI.typing)}
                  </li>
                )}
                {withForm && !typing && <li>{callForm(true)}</li>}
                <li ref={chatEnd} aria-hidden className="h-px" />
              </ol>
              <p className="mt-4 text-[13px] text-white/75">{t(UI.chatHint)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {REPLIES.map((r) => (
                  <button key={r.id} type="button" onClick={() => act(r.id)} className="chip ctl-sm rounded-full border-white/40 px-3 text-[12px] text-white">
                    {t(r.label)}
                  </button>
                ))}
              </div>
              <form onSubmit={ask} className="mt-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t(UI.chatPlaceholder)}
                  aria-label={t(UI.chat)}
                  enterKeyHint="send"
                  maxLength={300}
                  className="field ctl-sm min-w-0 flex-1"
                  autoFocus
                />
                <button type="submit" disabled={!draft.trim() || typing} aria-label={t(UI.chatSend)} className="btn btn-primary btn-sm w-10 shrink-0 px-0 disabled:opacity-50">
                  <Icon name="arrow" size={16} />
                </button>
              </form>
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
