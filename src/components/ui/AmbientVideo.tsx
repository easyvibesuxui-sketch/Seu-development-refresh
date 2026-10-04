"use client";

import { useEffect, useRef } from "react";
import { withBase } from "@/data/projects";

/**
 * Muted looping background film that only plays while on screen (saves battery and keeps the
 * map smooth). `name` resolves to /media/<name>.webm and .mp4 with a .jpg poster.
 */
export default function AmbientVideo({ name, className = "" }: { name: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      poster={withBase(`/media/${name}.jpg`)}
      aria-hidden
    >
      <source src={withBase(`/media/${name}.webm`)} type="video/webm" />
      <source src={withBase(`/media/${name}.mp4`)} type="video/mp4" />
    </video>
  );
}
