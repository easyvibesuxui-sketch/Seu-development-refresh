import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withBase } from "@/data/projects";
import { isExternal, news, newsBySlug } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";
import VideoBlock from "@/components/news/VideoBlock";
import BackLink from "@/components/ui/BackLink";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

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
      <section data-tone="dark" data-no-out className="tone-dark relative h-[86svh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <img src={src(item.image)} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-seu-ink/85 via-seu-ink/30 to-seu-bg" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1680px] flex-col justify-between px-gutter pb-16 pt-40">
          <div>
            <BackLink href="/news/" label="All news" />
          </div>
          <div>
            <div className="flex flex-wrap gap-3">
              <span className="tag tag-solid">{item.minutes} min read</span>
              <span className="tag tag-solid">{item.date}</span>
            </div>
            <h1 className="section-title mt-8 max-w-6xl text-[clamp(34px,4vw,72px)]" data-split>
              {item.title}
            </h1>
            <p className="lead mt-8 max-w-3xl text-seu-muted">{item.excerpt}</p>
          </div>
        </div>
      </section>

      <Section as="article" tone="light">
        <Container>
          <div className="mx-auto max-w-[68ch] space-y-6 text-[18px] leading-[1.8]" data-stagger>
            {BODY.map((p, i) => (
              <p key={p.slice(0, 20)} className={i === 0 ? "lead text-[22px]" : ""}>
                {p}
              </p>
            ))}
          </div>
          <div className="mx-auto my-24 max-w-5xl">
            <VideoBlock videoId={item.videoId ?? "6dCWXfB7nvc"} poster={src(item.videoId ? item.image : "/images/choose-varketili.jpg")} />
          </div>
          <div className="mx-auto max-w-[68ch] space-y-6 text-[18px] leading-[1.8]" data-stagger>
            {BODY.slice(0, 2).map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <div className="mx-auto mt-24 grid max-w-6xl gap-4 sm:grid-cols-3" data-stagger>
            {["/images/choose-varketili.jpg", "/images/varketili-panorama.jpg", "/images/upcoming-2.jpg"].map((g) => (
              <div key={g} className="group aspect-square overflow-hidden rounded-[20px]">
                <img src={withBase(g)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <SectionHeader eyebrow="Keep reading" title="More news" action={<ButtonLink href="/news/">All news</ButtonLink>} />
          <div className="mt-16 grid gap-8 md:grid-cols-12">
            {more.map((m, i) => (
              <NewsCard key={m.slug} item={m} wide={i === 0} />
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
