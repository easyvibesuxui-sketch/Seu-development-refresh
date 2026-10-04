import type { Metadata } from "next";
import { withBase } from "@/data/projects";
import { partners } from "@/components/home/Partners";
import TiltCard from "@/components/card/TiltCard";

export const metadata: Metadata = { title: "SEU Card" };

export default function CardPage() {
  return (
    <main className="bg-seu-cream text-[#1d1d1b]">
      <section className="grid items-center gap-12 px-6 pb-20 pt-40 md:grid-cols-2 md:px-12">
        <div>
          <h1 className="title-display text-[clamp(48px,5.4vw,84px)] uppercase leading-none" data-split>
            SEU Card
          </h1>
          <p className="mt-14 max-w-xl text-[19px] leading-[1.75]" data-stagger>
            When buying property in any of the company&apos;s projects, residents receive an exclusive personalized SEU card. They can use
            it at the company&apos;s partner establishments, taking advantage of exclusive conditions and discounts. You can see the full
            list of our partners below.
          </p>
        </div>
        <TiltCard />
      </section>

      <section className="px-6 pb-40 md:px-12">
        <h2 className="section-title uppercase text-[#15201d]" data-split>
          Partners.
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {partners.map((p) => (
            <article
              key={p.id}
              className="group rounded-xl bg-[#15201d] p-6 text-seu-cream transition-transform duration-500 hover:-translate-y-1"
            >
              <img src={withBase(p.logo)} alt={p.name} className="h-10 w-auto mix-blend-screen" loading="lazy" />
              <p className="mt-6 text-[14px] leading-relaxed text-seu-cream/70">
                Exclusive conditions for SEU card holders. Partner details and offers are published by SEU Development.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
