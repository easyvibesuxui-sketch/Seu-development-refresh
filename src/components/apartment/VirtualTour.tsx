"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { TOUR, tourStop, WALL_COLOURS, type TourLink, type TourPlace } from "@/data/tour";
import { useLang } from "@/lib/useLang";
import Icon, { type IconName } from "@/components/ui/Icon";

type Mode = "walk" | "dollhouse" | "plan";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(reducedQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);

/*
 * Matterport-style tour of a sample apartment: look around each place by dragging (or with the
 * arrow keys), step to the next place with the rings on the floor — a short Kling clip walks
 * you there — or jump from the dollhouse and the top-down plan. Wall colours repaint the walls
 * of every place through a mask, multiplied over the white paint so light and shade stay.
 */
export default function VirtualTour({ label }: { label: string }) {
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pan = useRef({ c: 0.5 });

  const [mode, setMode] = useState<Mode>("walk");
  const [place, setPlace] = useState<TourPlace>("hall");
  const [colour, setColour] = useState(WALL_COLOURS[0].id);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [walking, setWalking] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const [status, setStatus] = useState("");

  const stop = tourStop(place);
  const hex = WALL_COLOURS.find((c) => c.id === colour)?.hex ?? null;
  const imgW = size.h * stop.aspect;

  // The stage size drives the pan range; it changes with the window and with full screen.
  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const clampC = useCallback(
    (c: number) => {
      if (!imgW) return c;
      const half = Math.min(0.5, size.w / imgW / 2);
      return Math.min(1 - half, Math.max(half, c));
    },
    [imgW, size.w],
  );

  const place3 = useCallback(() => {
    const layer = layerRef.current;
    if (!layer || !imgW) return;
    layer.style.transform = `translate3d(${size.w / 2 - pan.current.c * imgW}px,0,0)`;
  }, [imgW, size.w]);

  useLayoutEffect(() => {
    pan.current.c = clampC(pan.current.c);
    place3();
  }, [clampC, place3, place]);

  const panTo = useCallback(
    (c: number, duration = 0.6) =>
      new Promise<void>((done) => {
        const target = clampC(c);
        if (reduce || duration === 0) {
          pan.current.c = target;
          place3();
          return done();
        }
        gsap.to(pan.current, { c: target, duration, ease: "power2.inOut", onUpdate: place3, onComplete: done });
      }),
    [clampC, place3, reduce],
  );

  // Drag to look around; arrow keys turn in steps.
  useEffect(() => {
    const el = viewRef.current;
    if (!el || mode !== "walk") return;
    let x0 = 0;
    let c0 = 0;
    let down = false;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      down = true;
      x0 = e.clientX;
      c0 = pan.current.c;
      gsap.killTweensOf(pan.current);
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down || !imgW) return;
      pan.current.c = clampC(c0 - (e.clientX - x0) / imgW);
      place3();
    };
    const onUp = () => (down = false);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [mode, imgW, clampC, place3]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    panTo(pan.current.c + (e.key === "ArrowLeft" ? -0.08 : 0.08), 0.35);
  };

  const arrive = useCallback(
    (to: TourPlace, c: number) => {
      pan.current.c = c;
      setPlace(to);
      setStatus(t(`You are in: ${tourStop(to).name[0]}`, `თქვენ ხართ: ${tourStop(to).name[1]}`));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang],
  );

  // A step without a clip (or with reduced motion): a short push into the ring and a cross-fade.
  const fadeTo = useCallback(
    async (to: TourPlace, c: number) => {
      const scene = sceneRef.current;
      if (scene && !reduce) await gsap.to(scene, { opacity: 0, scale: 1.06, duration: 0.35, ease: "power2.in" });
      arrive(to, c);
      if (scene && !reduce) gsap.fromTo(scene, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out", delay: 0.05 });
    },
    [arrive, reduce],
  );

  const walk = async (link: TourLink) => {
    if (walking) return;
    const next = tourStop(link.to);
    if (!link.clip || reduce) return fadeTo(link.to, link.land ?? next.start);
    const video = videoRef.current;
    if (!video) return fadeTo(link.to, link.land ?? next.start);
    setWalking(link.clip);
    const mp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== "";
    video.src = withBase(`/tour/walk-${link.clip}.${mp4 ? "mp4" : "webm"}`);
    video.load();
    const ready = new Promise<void>((ok) => {
      const go = () => ok();
      video.addEventListener("canplaythrough", go, { once: true });
      setTimeout(go, 2500);
    });
    await Promise.all([panTo(link.from ?? 0.5), ready]);
    video.currentTime = 0;
    gsap.set(video, { opacity: 1 });
    try {
      await video.play();
    } catch {
      gsap.set(video, { opacity: 0 });
      setWalking(null);
      return fadeTo(link.to, link.land ?? next.start);
    }
    // The clip's end, or a stalled clip's expected end, whichever comes first.
    await new Promise<void>((ok) => {
      video.addEventListener("ended", () => ok(), { once: true });
      setTimeout(ok, ((video.duration || 5) + 1.5) * 1000);
    });
    arrive(link.to, link.land ?? next.start);
    await gsap.to(video, { opacity: 0, duration: 0.3, delay: 0.05 });
    setWalking(null);
  };

  const jump = (to: TourPlace) => {
    setMode("walk");
    arrive(to, tourStop(to).start);
  };

  const toggleFull = async () => {
    const root = rootRef.current;
    if (!root) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await root.requestFullscreen?.();
  };
  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const modes: [Mode, IconName, string][] = [
    ["walk", "walk", t("Walk", "სვლა")],
    ["dollhouse", "house", t("Dollhouse", "მაკეტი")],
    ["plan", "plan", t("Top-down plan", "ზედხედი")],
  ];

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-seu-ink" aria-label={label} role="region">
      {mode === "walk" ? (
        <div
          key="walk"
          ref={viewRef}
          tabIndex={0}
          role="group"
          aria-roledescription={t("tour view", "ტურის ხედი")}
          aria-label={t(
            `${stop.name[0]}. Drag or use the left and right arrow keys to look around; the rings on the floor take you to the next room.`,
            `${stop.name[1]}. მიმოიხედეთ გადათრევით ან მარცხენა და მარჯვენა ისრებით; იატაკზე წრეები შემდეგ ოთახში გადაგიყვანთ.`,
          )}
          onKeyDown={onKey}
          data-cursor="drag"
          className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
        >
          <div ref={sceneRef} className="absolute inset-0">
            <div ref={layerRef} className="absolute inset-y-0 left-0 will-change-transform" style={{ width: imgW || undefined }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(stop.src)} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
              {stop.walls && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                  style={{
                    backgroundColor: hex ?? "transparent",
                    opacity: hex && !walking ? 1 : 0,
                    mixBlendMode: "multiply",
                    WebkitMaskImage: `url(${withBase(stop.walls)})`,
                    maskImage: `url(${withBase(stop.walls)})`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                  }}
                />
              )}
              {!walking &&
                stop.links.map((l) => (
                  <button
                    key={l.to}
                    type="button"
                    onClick={() => walk(l)}
                    onFocus={() => panTo(l.x, 0.4)}
                    aria-label={t(`Go to ${tourStop(l.to).name[0]}`, `გადასვლა: ${tourStop(l.to).name[1]}`)}
                    className="tour-ring group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%` }}
                  >
                    <span aria-hidden className="tour-ring__disc" />
                    <span className="tour-ring__tip">{t(tourStop(l.to).name[0], tourStop(l.to).name[1])}</span>
                  </button>
                ))}
            </div>
          </div>
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
          />
        </div>
      ) : (
        <div key="model" className="absolute inset-0 bg-seu-paper">
          {/* The model keeps its 4:3 box inside the stage, so the room markers stay on their rooms. */}
          <div className="absolute inset-x-4 bottom-16 top-14 grid place-items-center [container-type:size]">
            <div className="relative aspect-[4/3]" style={{ width: "min(100cqw, calc(100cqh * 4 / 3))" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBase(mode === "dollhouse" ? "/tour/dollhouse.jpg" : "/tour/plan.jpg")}
                alt={mode === "dollhouse" ? t("Dollhouse view of the apartment", "ბინის მაკეტი") : t("Top-down view of the apartment", "ბინის ზედხედი")}
                className="absolute inset-0 h-full w-full"
              />
              <ul>
                {TOUR.map((s) => {
                  const [x, y] = mode === "dollhouse" ? s.doll : s.plan;
                  return (
                    <li key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
                      <button type="button" onClick={() => jump(s.id)} className="tour-dot" aria-current={s.id === place ? "location" : undefined}>
                        <span aria-hidden className="tour-dot__pin" />
                        <span className="tour-dot__label max-sm:sr-only">{t(s.name[0], s.name[1])}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Where you are, and full screen. */}
      <div className="absolute right-4 top-16 z-10 flex items-center gap-2 sm:top-4">
        {mode === "walk" && (
          <p className="glass glass-dark hidden rounded-full px-4 py-2 text-[13px] text-white sm:block">{t(stop.name[0], stop.name[1])}</p>
        )}
        <button
          type="button"
          onClick={toggleFull}
          aria-pressed={full}
          aria-label={full ? t("Exit full screen", "სრული ეკრანიდან გასვლა") : t("Full screen", "სრული ეკრანი")}
          className="glass glass-dark grid h-10 w-10 place-items-center rounded-full text-white"
        >
          <Icon name={full ? "shrink" : "expand"} size={18} />
        </button>
      </div>

      {/* Modes, bottom left — as in the reference: walk, dollhouse, plan. */}
      <div role="group" aria-label={t("Tour mode", "ტურის რეჟიმი")} className="glass glass-dark absolute bottom-4 left-4 z-10 flex gap-1 rounded-full p-1">
        {modes.map(([m, icon, name]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            aria-label={name}
            title={name}
            onClick={() => setMode(m)}
            className="grid h-8 w-8 place-items-center rounded-full text-white transition-colors sm:h-9 sm:w-9 hover:bg-white/15 aria-pressed:bg-white aria-pressed:text-seu-ink"
          >
            <Icon name={icon} size={18} />
          </button>
        ))}
      </div>

      {/* Wall colours, bottom right. */}
      {mode === "walk" && (
        <fieldset className="glass glass-dark absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-full p-1 sm:gap-1.5 sm:pl-3">
          <legend className="sr-only">{t("Wall colour", "კედლის ფერი")}</legend>
          <Icon name="palette" size={16} className="mr-1 hidden text-white sm:block" />
          {WALL_COLOURS.map((c) => (
            <label key={c.id} title={t(c.name[0], c.name[1])} className="tour-swatch">
              <input type="radio" name="wall-colour" value={c.id} checked={colour === c.id} onChange={() => setColour(c.id)} className="sr-only" />
              <span aria-hidden style={{ background: c.hex ?? "#f3ece1" }} />
              <span className="sr-only">{t(c.name[0], c.name[1])}</span>
            </label>
          ))}
        </fieldset>
      )}

      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
