import type { Metadata } from "next";
import { withBase } from "@/data/projects";
import Partners from "@/components/home/Partners";
import ContactSection from "@/components/home/ContactSection";
import Hiring from "@/components/about/Hiring";

export const metadata: Metadata = { title: "About" };

const CHIPS = [
  { label: "Team", href: "#team" },
  { label: "Mission", href: "#mission" },
  { label: "Career", href: "#career" },
  { label: "Partners", href: "#partners" },
];

const MISSION = [
  "SEU Development has been operating in the real estate market since 2014.",
  "The company's team, consisting of experienced professionals who care about continuous development, implements high construction standards and uses innovative and modern approaches that meet international standards.",
  "Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University SEU, which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi. All SEU Development construction projects are fully funded at an early stage, which ensures they are completed on time. The company's social responsibility ensures that it only uses energy-efficient building materials for its projects.",
  "SEU Development aims to create a multifunctional residential complex that meets the needs and wishes of each client and ensures that such projects are accessible to every member of society.",
];

// Placeholder roster: the design shows one team member; names and roles to be supplied by SEU.
const TEAM = Array.from({ length: 4 }, (_, i) => ({ id: i, name: "Kate Arveladze", role: "Marketing & SEO", photo: "/images/team-1.jpg" }));

export default function AboutPage() {
  return (
    <main>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <img src={withBase("/images/office.jpg")} alt="SEU Development office" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/80 via-[#15201d]/10 to-[#15201d]" />
        <div className="relative z-10 px-6 pt-40 md:px-12">
          <p className="title-display text-[clamp(26px,2.4vw,36px)]" data-split>
            The company&apos;s team
          </p>
          <h1 className="title-display mt-2 text-[clamp(40px,4.4vw,68px)] italic" data-split>
            SEU Development
          </h1>
        </div>
        <nav className="absolute inset-x-6 bottom-16 z-10 flex flex-wrap justify-center gap-4 md:gap-8" aria-label="About sections" data-stagger>
          {CHIPS.map((c) => (
            <a key={c.href} href={c.href} className="group label flex items-stretch text-[12px] uppercase tracking-[0.16em]">
              <span className="-skew-x-[20deg] border border-seu-cream px-3 py-1.5">
                <span className="inline-block skew-x-[20deg]">Our</span>
              </span>
              <span className="-ml-px -skew-x-[20deg] bg-seu-cream px-5 py-1.5 text-[#15201d] transition-colors group-hover:bg-seu-accent group-hover:text-white">
                <span className="inline-block skew-x-[20deg]">{c.label}</span>
              </span>
            </a>
          ))}
        </nav>
      </section>

      <section id="mission" className="mx-auto max-w-3xl px-6 py-40 text-center">
        <h2 className="section-title" data-split>
          Our Mission
        </h2>
        <div className="mt-12 space-y-6 text-[17px] leading-[1.75] text-seu-cream/80" data-stagger>
          {MISSION.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
      </section>

      <section id="team" className="relative overflow-hidden py-32">
        <div className="absolute inset-0 opacity-35" data-parallax="0.1">
          <img src={withBase("/images/office.jpg")} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#15201d] via-[#15201d]/40 to-[#15201d]" />
        <div className="relative grid gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:px-12">
          <div className="flex flex-col">
            <h2 className="section-title uppercase" data-split>
              Our Team.
            </h2>
            <p className="title-display mt-6 text-[24px] italic">Meet our leaders</p>
            <p className="mt-auto max-w-sm pt-12 text-[15px] leading-relaxed text-seu-cream/80">
              Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University,
              which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi.
            </p>
          </div>
          <div className="-mr-6 flex snap-x gap-6 overflow-x-auto pb-4 pr-6 md:-mr-12 md:pr-12" data-cursor="drag">
            {TEAM.map((m) => (
              <figure key={m.id} className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-md border border-white/30 bg-[#15201d]">
                <div className="overflow-hidden">
                  <img src={withBase(m.photo)} alt={m.name} className="aspect-[3/4] w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <figcaption className="py-4 text-center">
                  <p className="label text-[15px] uppercase tracking-[0.06em]">{m.name}</p>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.1em] text-seu-muted">{m.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Hiring />

      <div id="partners" className="pt-40">
        <Partners variant="grid" subtitle="80+ partners trust us" />
      </div>
      <ContactSection />
    </main>
  );
}
