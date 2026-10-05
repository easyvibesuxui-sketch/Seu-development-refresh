import type { Metadata } from "next";
import Link from "next/link";
import { withBase } from "@/data/projects";
import { featured, news } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";
import PageHero from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  const rest = news.filter((n) => n.slug !== featured.slug);
  return (
    <main>
      <PageHero
        eyebrow="SEU Development"
        title="News"
        intro={
          <>
            Construction updates, interviews and videos from our sites.{" "}
            <a href="https://www.youtube.com/@seudevelopment9577" target="_blank" rel="noreferrer" className="text-seu-fg underline decoration-seu-accent-hi decoration-2 underline-offset-4">
              Watch on YouTube ↗
            </a>
          </>
        }
      />

      <Section tone="dark" className="pb-0">
        <Link href={`/news/${featured.slug}/`} className="group relative mx-gutter block h-[78vh] min-h-[480px] overflow-hidden rounded-[28px]" data-window>
          <div className="absolute inset-0 animate-[kenburns_18s_ease-in-out_infinite_alternate]">
            <img src={withBase(featured.image)} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-seu-ink/90 via-seu-ink/20 to-transparent" />
          <div className="absolute inset-x-8 bottom-10 md:inset-x-12 md:bottom-14">
            <p className="eyebrow text-white/85 [--muted:rgb(255_255_255/0.85)]">Featured</p>
            <h2 className="section-title mt-5 max-w-5xl text-[clamp(30px,3.4vw,60px)] text-white">{featured.title}</h2>
            <span className="btn btn-primary mt-8">Read the article</span>
          </div>
        </Link>
      </Section>

      <Section tone="dark">
        <Container>
          {/* Alternating 7/5 and 5/7 rows, as in the design. */}
          <div className="grid gap-8 md:grid-cols-12" data-stagger>
            {rest.map((item, i) => (
              <NewsCard key={item.slug} item={item} wide={Math.floor(i / 2) % 2 === 0 ? i % 2 === 0 : i % 2 === 1} />
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
