"use client";

import { useEffect, useRef } from "react";
import { withBase } from "@/data/projects";

/**
 * The assistant's looping clip: muted, inline, behind the copy. Under reduced motion it stays
 * on the still frame. Decorative: the words around it say who she is.
 */
export default function AssistantVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      preload="auto"
      poster={withBase("/images/assistant.jpg")}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    >
      <source src={withBase("/media/assistant-loop.mp4")} type="video/mp4" />
    </video>
  );
}
