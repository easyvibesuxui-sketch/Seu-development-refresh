import { withBase } from "@/data/projects";

// The partner list comes from the CMS on the live site; the design uses Bank of Georgia as placeholder.
export const partners = Array.from({ length: 8 }, (_, i) => ({ id: i, name: "Bank of Georgia", logo: "/images/partner-bog.png" }));

function Tile({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="grid h-24 place-items-center rounded-lg border border-white/40 px-6 grayscale transition duration-500 hover:-translate-y-1 hover:border-seu-accent hover:grayscale-0">
      <img src={withBase(logo)} alt={name} className="max-h-10 w-auto mix-blend-screen" loading="lazy" />
    </div>
  );
}

/** Marquee on the home page; a grid (as in the About / SEU Card designs) elsewhere. */
export default function Partners({ variant = "marquee", subtitle }: { variant?: "marquee" | "grid"; subtitle?: string }) {
  if (variant === "grid") {
    return (
      <section className="pb-40">
        <div className="bg-seu-cream px-6 pt-24 text-[#15201d] md:px-12">
          <h2 className="section-title translate-y-[0.18em] uppercase" data-split>
            Partners.
          </h2>
        </div>
        <div className="px-6 md:px-12">
          {subtitle && <p className="mt-8 text-[17px]">{subtitle}</p>}
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-12" data-stagger>
            {partners.map((p) => (
              <Tile key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const row = [...partners, ...partners];
  return (
    <section className="overflow-hidden pb-48">
      <h2 className="section-title px-6 uppercase md:px-12" data-split>
        Partners.
      </h2>
      <div className="marquee mt-20 flex w-max gap-8">
        {row.map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-60 shrink-0">
            <Tile {...p} />
          </div>
        ))}
      </div>
    </section>
  );
}
