import { withBase } from "@/data/projects";

// The partner list comes from the CMS on the live site; the design uses Bank of Georgia as placeholder.
const partners = Array.from({ length: 8 }, (_, i) => ({ id: i, name: "Bank of Georgia", logo: "/images/partner-bog.png" }));

export default function Partners() {
  const row = [...partners, ...partners];
  return (
    <section className="overflow-hidden pb-48">
      <h2 className="section-title px-6 uppercase md:px-12" data-split>
        Partners.
      </h2>
      <div className="marquee mt-20 flex w-max gap-8">
        {row.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="grid h-24 w-60 shrink-0 place-items-center rounded-lg border border-white/40 px-6 grayscale transition hover:border-seu-accent hover:grayscale-0"
          >
            <img src={withBase(p.logo)} alt={p.name} className="max-h-10 w-auto mix-blend-screen" />
          </div>
        ))}
      </div>
    </section>
  );
}
