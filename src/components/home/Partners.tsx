import LogoLines from "@/components/brand/LogoLines";
import { withBase } from "@/data/projects";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

// The partner list comes from the CMS on the live site; the design uses Bank of Georgia as placeholder.
export const partners = Array.from({ length: 8 }, (_, i) => ({ id: i, name: "Bank of Georgia", logo: "/images/partner-bog.png" }));

function Tile({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="grid h-28 place-items-center rounded-[20px] border border-seu-line bg-seu-ink/40 px-6 grayscale transition duration-500 hover:-translate-y-1 hover:border-seu-accent-hi hover:grayscale-0">
      <img src={withBase(logo)} alt={name} className="max-h-10 w-auto" loading="lazy" />
    </div>
  );
}

/** Marquee on the home page; a grid (as in the About / SEU Card designs) elsewhere. */
export default function Partners({ variant = "marquee", subtitle }: { variant?: "marquee" | "grid"; subtitle?: string }) {
  if (variant === "grid") {
    return (
      <Section tone="dark">
        <Container>
          <SectionHeader eyebrow="Together with" title="Partners" intro={subtitle} />
          <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4" data-stagger>
            {partners.map((p) => (
              <Tile key={p.id} {...p} />
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  const row = [...partners, ...partners];
  return (
    <Section tone="dark" className="overflow-hidden">
      <LogoLines x={0.82} size={0.8} />
      <Container className="relative">
        <SectionHeader index="06" eyebrow="Together with" title="Partners" />
      </Container>
      <div className="marquee relative mt-20 flex w-max gap-6">
        {row.map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-64 shrink-0">
            <Tile {...p} />
          </div>
        ))}
      </div>
    </Section>
  );
}
