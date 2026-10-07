"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { withBase } from "@/data/projects";
import { MAP_READY_EVENT, mapIsReady, startIntro } from "@/lib/intro";
import { useLang } from "@/lib/useLang";

const MAX_WAIT_MS = 9000;
// Module state survives client-side navigation, so returning to the home page skips the loader.
let played = false;
/** Fallback pacing when the video can't play (autoplay blocked, low-power mode). */
const FALLBACK_MS = 2600;

/**
 * Shown on every full page load (first visit and refresh). A short film of the SEU wireframe
 * slabs stacking into the logo plays while the hero map loads; the counter follows the film,
 * and the page reveals once both the film has built the logo and the map is ready.
 */
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const countRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root) return;
    if (played) {
      root.style.display = "none";
      startIntro();
      return;
    }
    played = true;
    // The WebGL map can stall frames while tiles load; keep timelines on wall-clock time.
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("is-loading");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const started = performance.now();
    let mapReady = mapIsReady();
    let filmDone = reduce;
    let finished = false;
    let shown = 0;
    // Follow the film; switch to timed pacing only if it can't play or hasn't started in time.
    let timedFrom: number | null = video && !reduce ? null : started;
    const switchToTimer = () => {
      if (timedFrom === null) timedFrom = performance.now();
    };
    const stallGuard = window.setTimeout(() => {
      if (!video || video.paused) switchToTimer();
    }, 1500);

    const filmProgress = () => {
      if (timedFrom !== null) return Math.min(1, (performance.now() - timedFrom) / FALLBACK_MS);
      if (video && video.duration) return video.currentTime / video.duration;
      return 0;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      gsap
        .timeline()
        .to({ v: shown }, {
          v: 100,
          duration: 0.4,
          ease: "power2.out",
          onUpdate() {
            if (countRef.current) countRef.current.textContent = String(Math.round(this.targets()[0].v));
          },
        })
        .add(() => startIntro())
        .to(root, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0.2 : 1.1, ease: "expo.inOut" }, "+=0.1")
        .add(() => {
          document.documentElement.classList.remove("is-loading");
          root.style.display = "none";
        });
    };

    // Counter tracks the film up to 95%; the last step waits for the map.
    const tick = () => {
      if (finished) return;
      const p = filmProgress();
      if (p >= 0.92) filmDone = true;
      shown = Math.max(shown, Math.min(95, Math.round(p * 100)));
      if (countRef.current) countRef.current.textContent = String(shown);
      if (filmDone && mapReady) finish();
    };
    gsap.ticker.add(tick);

    const onMapReady = () => {
      mapReady = true;
    };
    window.addEventListener(MAP_READY_EVENT, onMapReady);
    const fallback = window.setTimeout(finish, MAX_WAIT_MS);

    if (video && !reduce) {
      video.addEventListener("error", switchToTimer, { once: true });
      video.play().catch(switchToTimer);
    }

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener(MAP_READY_EVENT, onMapReady);
      window.clearTimeout(fallback);
      window.clearTimeout(stallGuard);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader" role="status" aria-label={lang === "ka" ? "იტვირთება" : "Loading"}>
      <video
        ref={videoRef}
        className="pl-film"
        muted
        playsInline
        preload="auto"
        poster={withBase("/media/seu-loader-poster.jpg")}
        aria-hidden
      >
        <source src={withBase("/media/seu-loader.webm")} type="video/webm" />
        <source src={withBase("/media/seu-loader.mp4")} type="video/mp4" />
      </video>
      <p className="pl-count" aria-hidden>
        <span ref={countRef}>0</span>
        <sup>%</sup>
      </p>
    </div>
  );
}
