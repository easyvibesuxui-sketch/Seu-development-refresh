import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { withBase } from "@/data/projects";
import { isExternal, news, newsBySlug } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";
import VideoBlock from "@/components/news/VideoBlock";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: newsBySlug(slug)?.title ?? "News" };
}

// Article body: the company copy used across the site (the CMS text is not available in this concept).
const BODY = [
  "SEU Development has been operating in the real estate market since 2014.",
  "The company's team, consisting of experienced professionals who care about continuous development, implements high construction standards and uses innovative and modern approaches that meet European standards.",
  "Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University, which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi. All SEU Development construction projects are fully funded at an early stage, which ensures they are completed on time. The company's social responsibility ensures that it only uses energy efficient building materials for its projects.",
  "SEU Development aims to create a multifunctional residential complex that meets the needs and wishes of each client and ensures that such projects are accessible to every member of society.",
];

export default async function NewsPostPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) notFound();
  const src = (s: string) => (isExternal(s) ? s : withBase(s));
  const more = news.filter((n) => n.slug !== slug).slice(0, 2);

  return (
    <main>
      <section className="relative h-[78vh] min-h-[520px] overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <img src={src(item.image)} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/90 via-[#15201d]/30 to-[#15201d]/80" />
        <div className="relative z-10 px-6 pt-36 md:px-12">
          <Link href="/news/" className="label text-[13px] uppercase tracking-[0.16em] text-seu-muted hover:text-seu-accent-hi">
            ← News
          </Link>
          <h1 className="title-display mt-6 max-w-4xl text-[clamp(38px,4.6vw,72px)] leading-[1.05]" data-split>
            {item.title}
          </h1>
          <div className="mt-6 flex gap-3">
            <span className="label rounded bg-seu-cream px-3 py-1 text-[12px] uppercase text-[#15201d]">{item.minutes} min read</span>
            <span className="label rounded bg-seu-cream px-3 py-1 text-[12px] text-[#15201d]">{item.date}</span>
          </div>
        </div>
        <p className="absolute bottom-8 left-6 z-10 text-[18px] md:left-12">{item.excerpt}</p>
      </section>

      <article className="bg-seu-cream px-6 py-24 text-[#1d1d1b] md:px-12">
        <div className="mx-auto max-w-4xl space-y-6 text-[17px] leading-[1.75]" data-stagger>
          {BODY.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
        <div className="mx-auto my-20 max-w-3xl">
          <VideoBlock videoId={item.videoId ?? "6dCWXfB7nvc"} poster={src(item.videoId ? item.image : "/images/choose-varketili.jpg")} />
        </div>
        <div className="mx-auto max-w-4xl space-y-6 text-[17px] leading-[1.75]" data-stagger>
          {BODY.slice(0, 2).map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
        <div className="mx-auto mt-20 grid max-w-6xl gap-4 sm:grid-cols-3" data-stagger>
          {["/images/choose-varketili.jpg", "/images/varketili-panorama.jpg", "/images/upcoming-2.jpg"].map((g) => (
            <div key={g} className="group aspect-square overflow-hidden rounded-md">
              <img src={withBase(g)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
            </div>
          ))}
        </div>
      </article>

      <section className="px-6 py-32 md:px-12">
        <h2 className="section-title" data-split>
          More news
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-12">
          {more.map((m, i) => (
            <NewsCard key={m.slug} item={m} wide={i === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}
