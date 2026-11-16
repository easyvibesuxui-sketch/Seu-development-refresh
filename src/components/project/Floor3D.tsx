"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { bedroomsIn, unitStatusIn, type Unit } from "@/data/inventory";
import { useHref, useLang } from "@/lib/useLang";
import Icon from "@/components/ui/Icon";
import { UNIT_SHAPES, centre } from "@/data/floorplan";

/*
 * 3D floor: the Kling cutaway of the top floor (public/images/floor-cutaway.jpg) opens the
 * view, then the same render, straightened onto the plan grid (public/images/floor-3d.webp,
 * 2:1 like floor-plan.jpg), becomes a slab the visitor turns through 360° by dragging.
 * UNIT_SHAPES line up with it, so each flat is picked straight on the slab.
 */
const PHOTO = "/images/floor-cutaway.jpg";
const SLAB = "/images/floor-3d.webp";
const narrow = () => window.matchMedia("(max-width: 639px)").matches;
const rest = () => ({ a: -24, t: 54, ...(narrow() ? { s: 0.9, y: 6 } : { s: 0.8, y: 7 }) });
const PHOTO_RATIO = 2000 / 1116;
// The slab in the cutaway photo: share of the photo's width, and centre height.
const PHOTO_SLAB = { w: 0.84, cy: 0.433 };
const ZOOM = 1.12;
// Where the slab sits inside the plate image, in percent (the rest is transparent).
const EDGE = { left: 1.2, top: 2.5, right: 0.7, bottom: 7.5 };

type View = { a: number; t: number; s: number; y: number };

export default function Floor3D({ units, fill }: { units: Unit[]; fill: Record<Unit["status"], string> }) {
  const lang = useLang();
  const h = useHref();
  const router = useRouter();
  const t = (en: string, ka: string) => (lang === "ka" ? ka : en);
  const stageRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ a: 0, t: 0, s: 1, y: 0 });
  const spin = useRef(0); // degrees per frame while coasting or idling
  const touched = useRef(false);
  const moved = useRef(false);
  const resting = useRef(false); // pointer over the stage: hold the idle turn so flats are easy to pick
  const [hover, setHover] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const paint = () => {
    const el = stageRef.current;
    if (!el) return;
    const v = view.current;
    el.style.setProperty("--a", `${v.a}deg`);
    el.style.setProperty("--t", `${v.t}deg`);
    el.style.setProperty("--s", `${v.s}`);
    el.style.setProperty("--y", `${v.y}%`);
  };

  // Intro: the cutaway photo pushes in, hands over to the slab, and the slab tips into 3D.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      view.current = rest();
      paint();
      if (photoRef.current) photoRef.current.style.opacity = "0";
      if (worldRef.current) worldRef.current.style.opacity = "1";
      const id = requestAnimationFrame(() => setLive(true));
      return () => cancelAnimationFrame(id);
    }
    // Start the slab exactly over the slab in the (zoomed) photo, so the hand-over is seamless.
    const st = stageRef.current!.getBoundingClientRect();
    const ww = worldRef.current!.offsetWidth;
    const wh = ww / 2;
    const photoW = st.width / st.height < PHOTO_RATIO ? st.height * PHOTO_RATIO : st.width;
    const photoH = photoW / PHOTO_RATIO;
    const s0 = (ZOOM * PHOTO_SLAB.w * photoW) / ((1 - (EDGE.left + EDGE.right) / 100) * ww);
    const cy = st.height / 2 + (PHOTO_SLAB.cy - 0.5) * photoH;
    const zoomed = 0.43 * st.height + (cy - 0.43 * st.height) * ZOOM - st.height / 2;
    const inWorld = ((EDGE.top + (100 - EDGE.bottom)) / 200 - 0.5) * wh * s0;
    view.current = { a: 0, t: 0, s: s0, y: ((zoomed - inWorld) / wh) * 100 };
    paint();
    const tl = gsap.timeline({ onComplete: () => setLive(true) });
    tl.fromTo(photoRef.current, { scale: 1, opacity: 1 }, { scale: ZOOM, duration: 1.1, ease: "power2.inOut" })
      .to(worldRef.current, { opacity: 1, duration: 0.45, ease: "power1.out" }, ">-0.15")
      .to(photoRef.current, { opacity: 0, duration: 0.6, ease: "power1.out" }, "<")
      .to(view.current, { ...rest(), duration: 1.6, ease: "power3.inOut", onUpdate: paint }, "<0.1");
    return () => {
      tl.kill();
    };
  }, []);

  // After the intro the slab turns slowly until the visitor takes over; a released drag coasts.
  useEffect(() => {
    if (!live) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      if (!touched.current) spin.current = reduce || resting.current ? 0 : 0.08;
      if (Math.abs(spin.current) > 0.01) {
        view.current.a += spin.current;
        if (touched.current) spin.current *= 0.94;
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    touched.current = true;
    moved.current = false;
    spin.current = 0;
    let x = e.clientX;
    let y = e.clientY;
    let last = performance.now();
    const isMouse = e.pointerType === "mouse";
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x;
      const dy = ev.clientY - y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      const now = performance.now();
      const da = dx * 0.35;
      view.current.a += da;
      // Mouse drags also tip the slab; on touch, vertical moves stay with the page scroll.
      if (isMouse) view.current.t = Math.min(68, Math.max(0, view.current.t - dy * 0.25));
      spin.current = (da / Math.max(8, now - last)) * 16;
      last = now;
      x = ev.clientX;
      y = ev.clientY;
      paint();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (performance.now() - last > 80) spin.current = 0;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, 6], ArrowDown: [0, -6] };
    const s = step[e.key];
    if (!s || e.target !== e.currentTarget) return;
    e.preventDefault();
    touched.current = true;
    spin.current = 0;
    gsap.to(view.current, {
      a: view.current.a + s[0],
      t: Math.min(68, Math.max(0, view.current.t + s[1])),
      duration: 0.3,
      ease: "power2.out",
      onUpdate: paint,
    });
  };

  const reset = () => {
    touched.current = true;
    spin.current = 0;
    const r = rest();
    const target = r.a + Math.round((view.current.a - r.a) / 360) * 360;
    gsap.to(view.current, { ...r, a: target, duration: 0.9, ease: "power3.inOut", onUpdate: paint });
  };

  const open = (u: Unit) => {
    if (moved.current || u.status === "sold") return;
    router.push(h(`/apartments/${u.id}/`));
  };

  const side = "absolute [backface-visibility:hidden]";
  // A face of the tower: slab edge, then terracotta with window bands, fading as it falls away.
  const facade = (down: string, across: string) =>
    `linear-gradient(${down}, rgb(246 241 232 / .96) 0 7%, transparent 7%), repeating-linear-gradient(${across}, transparent 0 9px, rgb(17 25 35 / .45) 9px 14px), linear-gradient(${down}, #a5583b 7%, rgb(140 72 46 / .5) 50%, transparent 92%)`;

  return (
    <div className="relative mx-auto w-full max-w-[1080px]">
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription={t("3D floor", "3D სართული")}
        aria-label={t("3D floor. Drag or use the arrow keys to turn it; choose a flat to open it.", "3D სართული. გადაატრიალეთ დრაგით ან ისრებით; აირჩიეთ ბინა გასახსნელად.")}
        onPointerDown={onPointerDown}
        onPointerEnter={() => (resting.current = true)}
        onPointerLeave={() => (resting.current = false)}
        onKeyDown={onKeyDown}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="relative aspect-[4/3] w-full sm:aspect-[2000/1116] cursor-grab select-none overflow-hidden rounded-[20px] bg-[radial-gradient(120%_90%_at_50%_45%,#1d2836_0%,#0e141b_70%)] ring-1 ring-white/10 [touch-action:pan-y] active:cursor-grabbing"
        style={{ perspective: "1700px" }}
      >
        <img
          ref={photoRef}
          src={withBase(PHOTO)}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ transformOrigin: "50% 43%" }}
        />
        <div
          ref={worldRef}
          className="absolute left-1/2 top-1/2 w-[92%] opacity-0 [--d:110px] sm:w-[80%] sm:[--d:170px]"
          style={{
            aspectRatio: "2 / 1",
            transformStyle: "preserve-3d",
            transform: "translate(-50%, -50%) translateY(var(--y)) scale(var(--s)) rotateX(var(--t)) rotateZ(var(--a))",
          }}
        >
          {/* The tower under the slab: four faces hanging down, fading out. */}
          <div
            className="absolute"
            style={{ left: `${EDGE.left}%`, right: `${EDGE.right}%`, top: `${EDGE.top}%`, bottom: `${EDGE.bottom}%`, transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-[6px] bg-black/50 blur-2xl" style={{ transform: "translateZ(calc(var(--d) * -1)) scale(1.05)" }} />
            <div className={`${side} left-0 top-full h-[var(--d)] w-full origin-top`} style={{ transform: "rotateX(-90deg)", background: facade("to bottom", "to right") }} />
            <div className={`${side} bottom-full left-0 h-[var(--d)] w-full origin-bottom`} style={{ transform: "rotateX(90deg)", background: facade("to top", "to right") }} />
            <div className={`${side} right-full top-0 h-full w-[var(--d)] origin-right`} style={{ transform: "rotateY(-90deg)", background: facade("to left", "to bottom") }} />
            <div className={`${side} left-full top-0 h-full w-[var(--d)] origin-left`} style={{ transform: "rotateY(90deg)", background: facade("to right", "to bottom") }} />
          </div>
          <img src={withBase(SLAB)} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {units.map((u) => (
              <polygon
                key={u.id}
                points={UNIT_SHAPES[u.slot].map((pt) => pt.join(",")).join(" ")}
                fill={fill[u.status]}
                fillOpacity={hover === u.id ? 0.42 : 0.12}
                stroke={hover === u.id ? "#f6f1e8" : fill[u.status]}
                strokeOpacity={hover === u.id ? 1 : 0.5}
                strokeWidth={hover === u.id ? 2 : 1}
                vectorEffect="non-scaling-stroke"
                onPointerEnter={() => setHover(u.id)}
                onPointerLeave={() => setHover(null)}
                onClick={() => open(u)}
                className={u.status === "sold" ? "cursor-not-allowed" : "cursor-pointer"}
                style={{ transition: "fill-opacity .25s" }}
              />
            ))}
          </svg>
          {/* Labels stand upright facing the viewer whatever the turn. */}
          {units.map((u) => {
            const [cx, cy] = centre(UNIT_SHAPES[u.slot]);
            const on = hover === u.id;
            const sold = u.status === "sold";
            const pill = (
              <span
                className="grid place-items-center rounded-full text-center shadow-[0_10px_30px_rgb(0_0_0/0.4)] transition-transform duration-300"
                style={{
                  width: "clamp(28px, 3.4vw, 46px)",
                  height: "clamp(28px, 3.4vw, 46px)",
                  background: u.status === "available" ? "#f6f1e8" : fill[u.status],
                  color: u.status === "available" ? "#111923" : "#fff",
                  transform: `scale(${on ? 1.14 : 1})`,
                }}
              >
                <span className="flex flex-col items-center leading-tight">
                  {sold && <Icon name="lock" size={12} className="mb-0.5 hidden md:block" />}
                  <span className="label block text-[12px] font-semibold md:text-[13px]">{u.number}</span>
                </span>
              </span>
            );
            const name = `${t("Apartment", "ბინა")} ${u.number}, ${bedroomsIn(u.bedrooms, lang)}, ${u.totalArea} ${t("m²", "მ²")}, ${unitStatusIn(u.status, lang)}`;
            return (
              <div
                key={u.id}
                className={`absolute transition-opacity duration-500 ${live ? "opacity-100" : "pointer-events-none opacity-0"}`}
                style={{ left: `${cx}%`, top: `${cy}%`, transformStyle: "preserve-3d", transform: "translateZ(12px) rotateZ(calc(var(--a) * -1)) rotateX(calc(var(--t) * -1))" }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  {sold ? (
                    <span role="img" aria-label={name} onPointerEnter={() => setHover(u.id)} onPointerLeave={() => setHover(null)} className="block cursor-not-allowed">
                      {pill}
                    </span>
                  ) : (
                    <Link
                      href={h(`/apartments/${u.id}/`)}
                      aria-label={name}
                      draggable={false}
                      onPointerEnter={() => setHover(u.id)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(u.id)}
                      onBlur={() => setHover(null)}
                      className="block rounded-full"
                    >
                      {pill}
                    </Link>
                  )}
                  {on && (
                    <span className="label pointer-events-none absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 rounded-full bg-seu-ink/90 px-3 py-1.5 text-[12px] text-white ring-1 ring-white/20">
                      {sold
                        ? unitStatusIn("sold", lang)
                        : `${u.bedrooms === 0 ? t("Studio", "სტუდიო") : t(`${u.bedrooms} bd`, `${u.bedrooms} საძ.`)} · ${u.totalArea} ${t("m²", "მ²")}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 transition-opacity duration-300 sm:p-4 ${live ? "opacity-100" : "opacity-0"}`}
        >
          <span className="label flex items-center gap-2 rounded-full bg-seu-ink/70 px-3 py-1.5 sm:py-2 text-[12px] text-white/90 ring-1 ring-white/15 backdrop-blur-md">
            <Icon name="reset" size={14} className="-scale-x-100" />
            {t("Drag to turn", "გაწიეთ და გადაატრიალეთ")}
          </span>
          <button
            type="button"
            onClick={reset}
            onPointerDown={(e) => e.stopPropagation()}
            className="label pointer-events-auto rounded-full bg-seu-ink/70 px-3 py-1.5 sm:py-2 text-[12px] text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-seu-ink"
          >
            {t("Reset view", "საწყისი ხედი")}
          </button>
        </div>
      </div>
    </div>
  );
}
