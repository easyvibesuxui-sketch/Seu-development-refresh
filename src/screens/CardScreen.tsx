import type { Metadata } from "next";
import { withBase } from "@/data/projects";
import { tr, type Lang } from "@/lib/i18n";
import { partners } from "@/data/partners";
import TiltCard from "@/components/card/TiltCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

export const cardMeta = (lang: Lang): Metadata => ({ title: tr(lang)("SEU Card", "SEU ბარათი") });

export default function CardScreen({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <main>
      <Section tone="light" className="pt-44 md:pt-52">
        <Container className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-8">{t("For SEU residents", "SEU-ს მაცხოვრებლებისთვის")}</p>
            <h1 className="page-title" data-split>
              {t("SEU Card", "SEU ბარათი")}
              <span className="text-seu-accent-hi">.</span>
            </h1>
            <p className="lead mt-12 max-w-xl" data-stagger>
              {t(
                "When buying property in any of the company's projects, residents receive an exclusive personalized SEU card. They can use it at the company's partner establishments, taking advantage of exclusive conditions and discounts. You can see the full list of our partners below.",
                // The Georgian of seudevelopment.ge.
                "კომპანიის ნებისმიერ პროექტში უძრავი ქონების შეძენისას მაცხოვრებლები მიიღებენ ექსკლუზიურ პერსონალიზებულ SEU ბარათს. მაცხოვრებლები შეძლებენ ბარათის გამოყენებას კომპანიის პარტნიორ დაწესებულებებში, ექსკლუზიური პირობებითა და ფასდაკლებებით სარგებლობას. ქვემოთ შეგიძლიათ იხილოთ ჩვენი პარტნიორების სრული სია.",
              )}
            </p>
          </div>
          <TiltCard />
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <SectionHeader eyebrow={t("Where it works", "სად მოქმედებს")} title={t("Partners", "პარტნიორები")} />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {partners.map((p) => (
              <article key={p.id} className="card p-8">
                <img src={withBase(p.logo)} alt={p.name} className="h-10 w-auto self-start" loading="lazy" />
                <p className="body-copy mt-8">
                  {t(
                    "Exclusive conditions for SEU card holders. Partner details and offers are published by SEU Development.",
                    "ექსკლუზიური პირობები SEU ბარათის მფლობელებისთვის. პარტნიორების დეტალებსა და შეთავაზებებს SEU Development აქვეყნებს.",
                  )}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
