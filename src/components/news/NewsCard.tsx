import Link from "next/link";
import { withBase } from "@/data/projects";
import { isExternal, type NewsItem } from "@/data/news";

export default function NewsCard({ item, wide }: { item: NewsItem; wide?: boolean }) {
  return (
    <Link
      href={`/news/${item.slug}/`}
      className={`group flex flex-col rounded-md border border-white/30 bg-[#1b2724]/60 p-5 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-seu-accent-hi md:p-6 ${
        wide ? "md:col-span-7" : "md:col-span-5"
      }`}
    >
      <h3 className="title-display text-[clamp(18px,1.5vw,22px)] uppercase tracking-[0.03em]">{item.title}</h3>
      <div className="relative mt-4 aspect-[16/7] overflow-hidden rounded">
        <img
          src={isExternal(item.image) ? item.image : withBase(item.image)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
        {item.videoId && (
          <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-seu-accent/90">
            <svg width="12" height="14" viewBox="0 0 22 24" fill="none" className="ml-0.5" aria-hidden>
              <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="label rounded bg-seu-cream px-3 py-1 text-[12px] uppercase tracking-[0.06em] text-[#15201d]">{item.minutes} min read</span>
        <span className="label rounded bg-seu-cream px-3 py-1 text-[12px] uppercase tracking-[0.06em] text-[#15201d]">{item.tag}</span>
        <span className="label ml-auto self-center text-[12px] text-seu-muted">{item.date}</span>
      </div>
    </Link>
  );
}
