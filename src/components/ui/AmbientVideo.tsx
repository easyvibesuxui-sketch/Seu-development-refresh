"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/data/projects";

/**
 * Muted looping background film that only plays while on screen (saves battery and keeps the
 * map smooth). `name` resolves to /media/<name>.webm and .mp4 with a .jpg poster. Nothing is
 * fetched until the film comes within about a screen of the viewport.
 */
export default function AmbientVideo({ name, className = "" }: { name: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  // Poster and file only once the film is about to scroll into view.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !near) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // WebM where it plays (smaller), MP4 elsewhere (Safari).
    video.src = withBase(`/media/${name}.${video.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4"}`);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [near, name]);

  return <video ref={ref} className={className} muted loop playsInline preload="none" poster={near ? withBase(`/media/${name}.jpg`) : undefined} aria-hidden />;
}
