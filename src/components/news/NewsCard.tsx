import Link from "next/link";
import { withBase } from "@/data/projects";
import { isExternal, type NewsItem } from "@/data/news";

export default function NewsCard({ item, wide }: { item: NewsItem; wide?: boolean }) {
  return (
    <Link
      href={`/news/${item.slug}/`}
      className={`card group md:p-6 ${
        wide ? "md:col-span-7" : "md:col-span-5"
      }`}
    >
      <h3 className="title-m text-[clamp(20px,1.6vw,26px)]">{item.title}</h3>
      <div className="relative mt-5 aspect-[16/7] overflow-hidden rounded-[16px]">
        <img
          src={isExternal(item.image) ? item.image : withBase(item.image)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
        {item.videoId && (
          <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md">
            <svg width="12" height="14" viewBox="0 0 22 24" fill="none" className="ml-0.5" aria-hidden>
              <path d="M3 2l17 10L3 22V2z" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="tag tag-solid">{item.minutes} min read</span>
        <span className="tag tag-solid">{item.tag}</span>
        <span className="label ml-auto self-center text-[12px] text-seu-muted">{item.date}</span>
      </div>
    </Link>
  );
}
