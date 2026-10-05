import type { Metadata } from "next";
import { withBase } from "@/data/projects";
import { partners } from "@/components/home/Partners";
import TiltCard from "@/components/card/TiltCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = { title: "SEU Card" };

export default function CardPage() {
  return (
    <main>
      <Section tone="light" className="pt-44 md:pt-52">
        <Container className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-8">For SEU residents</p>
            <h1 className="page-title" data-split>
              SEU Card<span className="text-seu-accent-hi">.</span>
            </h1>
            <p className="lead mt-12 max-w-xl" data-stagger>
              When buying property in any of the company&apos;s projects, residents receive an exclusive personalized SEU card. They can use
              it at the company&apos;s partner establishments, taking advantage of exclusive conditions and discounts. You can see the full
              list of our partners below.
            </p>
          </div>
          <TiltCard />
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <SectionHeader eyebrow="Where it works" title="Partners" />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {partners.map((p) => (
              <article key={p.id} className="card p-8">
                <img src={withBase(p.logo)} alt={p.name} className="h-10 w-auto self-start" loading="lazy" />
                <p className="body-copy mt-8">Exclusive conditions for SEU card holders. Partner details and offers are published by SEU Development.</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
