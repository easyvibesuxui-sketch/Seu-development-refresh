import type { Metadata } from "next";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { featured, news } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  const rest = news.filter((n) => n.slug !== featured.slug);
  return (
    <main className="pt-36">
      <div className="px-6 md:px-12">
        <p className="label text-[14px] uppercase tracking-[0.2em] text-seu-muted">SEU Development</p>
        <h1 className="title-display mt-2 text-[clamp(48px,6vw,96px)] leading-none" data-split>
          News
        </h1>
      </div>

      <Link href={`/news/${featured.slug}/`} className="group relative mt-16 block h-[72vh] min-h-[460px] overflow-hidden">
        <div className="absolute inset-0 animate-[kenburns_18s_ease-in-out_infinite_alternate]">
          <img src={withBase(featured.image)} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#15201d] via-[#15201d]/20 to-[#15201d]/85" />
        <div className="absolute inset-x-6 bottom-16 text-center">
          <h2 className="title-display text-[clamp(34px,4vw,64px)]" data-split>
            {featured.title}
          </h2>
          <span className="label mt-6 inline-block rounded bg-seu-accent px-5 py-2 text-[12px] uppercase tracking-[0.16em] transition-colors group-hover:bg-seu-accent-hi">
            Read this article
          </span>
        </div>
      </Link>

      {/* Alternating 7/5 and 5/7 rows, as in the design. */}
      <div className="grid gap-8 px-6 py-24 md:grid-cols-12 md:px-12" data-stagger>
        {rest.map((item, i) => (
          <NewsCard key={item.slug} item={item} wide={Math.floor(i / 2) % 2 === 0 ? i % 2 === 0 : i % 2 === 1} />
        ))}
      </div>

      <section className="px-6 pb-40 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="section-title" data-split>
            Videos
          </h2>
          <a
            href="https://www.youtube.com/@seudevelopment9577"
            target="_blank"
            rel="noreferrer"
            className="label text-[13px] uppercase tracking-[0.14em] text-seu-accent-hi hover:underline"
          >
            Visit our channel ↗
          </a>
        </div>
      </section>
    </main>
  );
}
