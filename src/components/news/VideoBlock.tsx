"use client";

import { useState } from "react";
import { useT } from "@/lib/useLang";

export default function VideoBlock({ videoId, poster }: { videoId: string; poster: string }) {
  const [playing, setPlaying] = useState(false);
  const t = useT();
  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-seu-ink" data-cursor="play">
      {playing ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={t("Video", "ვიდეო")}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={t("Play video", "ვიდეოს ჩართვა")}>
          <img src={poster} alt="" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-b from-seu-ink/70 via-transparent to-seu-ink/90" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-seu-accent/90 transition-transform duration-500 group-hover:scale-110">
            <svg width="22" height="24" viewBox="0 0 22 24" fill="none" className="ml-1" aria-hidden>
              <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
