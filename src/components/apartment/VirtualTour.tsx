"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { FLOOR_FINISHES, TOUR, tourStop, WALL_COLOURS, type TourLink, type TourPlace } from "@/data/tour";
import { useLang } from "@/lib/useLang";
import Icon from "@/components/ui/Icon";
import Sheet from "@/components/ui/Sheet";

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
 * arrow keys) and step to the next place with the rings on the floor — a short Kling clip walks
 * you there. The dollhouse (3D) and the top-down plan (2D) are tabs of the apartment stage
 * (TourModel below) whose room markers open the tour in that room. Wall colours repaint the
 * walls of every place through a mask, multiplied over the white paint so light and shade stay;
 * floor finishes do the same for the oak parquet (hall, living room, second bedroom).
 * The expand button opens the same tour in a large window over the page (`expanded`), which
 * picks up the room and colour and hands them back when it closes.
 */
export default function VirtualTour({
  label,
  start,
  onPlace,
  colour,
  onColour,
  floor,
  onFloor,
  expanded = false,
  onClose,
}: {
  label: string;
  start: TourPlace;
  onPlace: (p: TourPlace) => void;
  colour: string;
  onColour: (id: string) => void;
  floor: string;
  onFloor: (id: string) => void;
  expanded?: boolean;
  onClose?: () => void;
}) {
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pan = useRef({ c: tourStop(start).start });

  const [place, setPlace] = useState<TourPlace>(start);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [walking, setWalking] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  const stop = tourStop(place);
  const hex = WALL_COLOURS.find((c) => c.id === colour)?.hex ?? null;
  const finish = FLOOR_FINISHES.find((f) => f.id === floor) ?? FLOOR_FINISHES[0];
  // Which palette the bar shows: walls or floor.
  const [paint, setPaint] = useState<"walls" | "floor">("walls");
  const imgW = size.h * stop.aspect;

  // The stage size drives the pan range; it changes with the window and with full screen.
  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    if (!el) return;
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
  }, [imgW, clampC, place3]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    panTo(pan.current.c + (e.key === "ArrowLeft" ? -0.08 : 0.08), 0.35);
  };

  const arrive = useCallback(
    (to: TourPlace, c: number) => {
      pan.current.c = c;
      setPlace(to);
      onPlace(to);
      setStatus(t(`You are in: ${tourStop(to).name[0]}`, `თქვენ ხართ: ${tourStop(to).name[1]}`));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, onPlace],
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

  // The large window reports where it is; closing it continues the tour in that room here.
  const bigPlace = useRef<TourPlace>(place);
  const openBig = () => {
    bigPlace.current = place;
    setOpen(true);
  };
  const closeBig = () => {
    setOpen(false);
    if (bigPlace.current === place) return;
    pan.current.c = tourStop(bigPlace.current).start;
    setPlace(bigPlace.current);
  };
  const onBigPlace = (p: TourPlace) => {
    bigPlace.current = p;
    onPlace(p);
  };

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-seu-ink" aria-label={label} role="region">
      <div
        ref={viewRef}
        tabIndex={0}
        role="group"
        aria-roledescription={t("tour view", "ტურის ხედი")}
        aria-label={t(
          `${stop.name[0]}. Drag or use the left and right arrow keys to look around; the rings on the floor take you to the next room.`,
          `${stop.name[1]}. მიმოიხედეთ გადაწევით ან მარცხენა და მარჯვენა ისრებით; იატაკზე წრეები შემდეგ ოთახში გადაგიყვანთ.`,
        )}
        onKeyDown={onKey}
        data-cursor="drag"
        className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        <div ref={sceneRef} className="absolute inset-0">
          <div ref={layerRef} className="absolute inset-y-0 left-0 will-change-transform" style={{ width: imgW || undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" src={withBase(stop.src)} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
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
            {stop.floor && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                  backgroundColor: finish.hex ?? "transparent",
                  opacity: finish.hex && !walking ? finish.opacity : 0,
                  mixBlendMode: finish.blend,
                  WebkitMaskImage: `url(${withBase(stop.floor)})`,
                  maskImage: `url(${withBase(stop.floor)})`,
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

      {/* Where you are, and the large window (open from the page, close inside it). */}
      <div className={`absolute z-10 flex items-center gap-2 ${expanded ? "right-4 top-4 sm:right-6 sm:top-6" : "right-4 top-16 sm:top-4"}`}>
        <p className={`glass glass-dark rounded-full px-4 py-2 text-[14px] text-white ${expanded ? "" : "hidden sm:block"}`}>{t(stop.name[0], stop.name[1])}</p>
        {expanded ? (
          <button type="button" onClick={onClose} aria-label={t("Close", "დახურვა")} className="grid h-11 w-11 place-items-center rounded-full bg-white text-seu-ink shadow-[0_6px_20px_rgb(0_0_0/0.25)] transition-transform hover:scale-105" data-autofocus>
            <Icon name="close" size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openBig}
            aria-haspopup="dialog"
            aria-label={t("Open the tour large", "ტურის დიდ ფანჯარაში გახსნა")}
            className="glass glass-dark grid h-11 w-11 place-items-center rounded-full text-white"
          >
            <Icon name="expand" size={18} />
          </button>
        )}
      </div>

      {/* Wall colours and floor finishes, bottom centre: one switch, one row of swatches. */}
      <div className={`glass glass-dark absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 rounded-[24px] p-1 min-[480px]:flex-row min-[480px]:rounded-full ${expanded ? "bottom-5 sm:bottom-6" : "bottom-4"}`}>
        <div className="segmented shrink-0 border-white/25 bg-transparent [--ctl-h:44px]" role="group" aria-label={t("Paint", "ფერი")}>
          {(["walls", "floor"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={paint === k} onClick={() => setPaint(k)} className={paint === k ? "" : "text-white"}>
              {k === "walls" ? t("Walls", "კედლები") : t("Floor", "იატაკი")}
            </button>
          ))}
        </div>
        {paint === "walls" ? (
          <fieldset className="flex items-center">
            <legend className="sr-only">{t("Wall colour", "კედლის ფერი")}</legend>
            {WALL_COLOURS.map((c) => (
              <label key={c.id} title={t(c.name[0], c.name[1])} className="tour-swatch">
                <input type="radio" name={`wall-colour${expanded ? "-big" : ""}`} value={c.id} checked={colour === c.id} onChange={() => onColour(c.id)} className="sr-only" />
                <span aria-hidden style={{ background: c.hex ?? "#f3ece1" }} />
                <span className="sr-only">{t(c.name[0], c.name[1])}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <fieldset className="flex items-center">
            <legend className="sr-only">{t("Floor finish", "იატაკის ფერი")}</legend>
            {FLOOR_FINISHES.map((f) => (
              <label key={f.id} title={t(f.name[0], f.name[1])} className="tour-swatch">
                <input type="radio" name={`floor-finish${expanded ? "-big" : ""}`} value={f.id} checked={floor === f.id} onChange={() => onFloor(f.id)} className="sr-only" />
                <span aria-hidden style={{ background: `repeating-linear-gradient(100deg, rgb(255 255 255 / 0.12) 0 2px, transparent 2px 6px), ${f.swatch}` }} />
                <span className="sr-only">{t(f.name[0], f.name[1])}</span>
              </label>
            ))}
          </fieldset>
        )}
      </div>
      {/* Rooms without parquet say so instead of silently ignoring the floor choice. */}
      {paint === "floor" && !stop.floor && (
        <p className={`glass glass-dark absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] text-white ${expanded ? "bottom-[148px] min-[480px]:bottom-[88px]" : "bottom-[136px] min-[480px]:bottom-[76px]"}`}>
          {t("This room has no parquet", "ამ ოთახში პარკეტი არ არის")}
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      {!expanded && (
        <Sheet open={open} onClose={closeBig} side="center" label={label} bodyClassName="relative">
          <VirtualTour label={label} start={place} onPlace={onBigPlace} colour={colour} onColour={onColour} floor={floor} onFloor={onFloor} expanded onClose={closeBig} />
        </Sheet>
      )}
    </div>
  );
}

/*
 * The apartment model of the tour, for the 3D (dollhouse) and 2D (top-down) tabs: the image keeps
 * its 4:3 box inside the stage so the room markers stay on their rooms; a marker opens the tour there.
 */
export function TourModel({ view, alt, current, onPick }: { view: "3d" | "2d"; alt: string; current?: TourPlace; onPick: (p: TourPlace) => void }) {
  const lang = useLang();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  return (
    <div className="absolute inset-x-4 bottom-20 top-16 grid place-items-center [container-type:size]">
      <div data-tab-img className="relative aspect-[4/3]" style={{ width: "min(100cqw, calc(100cqh * 4 / 3))" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={withBase(view === "3d" ? "/tour/dollhouse.jpg" : "/tour/plan.jpg")} alt={alt} className="absolute inset-0 h-full w-full" />
        <ul aria-label={t("Rooms: open the tour", "ოთახები: ტურის გახსნა")}>
          {TOUR.map((s) => {
            const [x, y] = view === "3d" ? s.doll : s.plan;
            return (
              <li key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
                <button
                  type="button"
                  onClick={() => onPick(s.id)}
                  className="tour-dot"
                  aria-current={s.id === current ? "location" : undefined}
                  aria-label={t(`${s.name[0]}: open the tour here`, `${s.name[1]}: ტურის გახსნა აქ`)}
                >
                  <span aria-hidden className="tour-dot__pin" />
                  <span aria-hidden className="tour-dot__label max-sm:hidden">
                    {t(s.name[0], s.name[1])}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
