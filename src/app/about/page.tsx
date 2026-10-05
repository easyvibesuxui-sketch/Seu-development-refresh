import type { Metadata } from "next";
import { withBase } from "@/data/projects";
import Partners from "@/components/home/Partners";
import ContactSection from "@/components/home/ContactSection";
import Hiring from "@/components/about/Hiring";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

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

// Illustrative roster for this concept: Kling portraits and sample names. SEU supplies the real team.
const TEAM = [
  { id: 1, name: "Giorgi Beridze", role: "Managing director", photo: "/images/team-1.jpg" },
  { id: 2, name: "Nino Kapanadze", role: "Head of sales", photo: "/images/team-2.jpg" },
  { id: 3, name: "Levan Tsiklauri", role: "Chief engineer", photo: "/images/team-3.jpg" },
  { id: 4, name: "Ana Japaridze", role: "Marketing & SEO", photo: "/images/team-4.jpg" },
];

export default function AboutPage() {
  return (
    <main>
      <section data-tone="dark" data-no-out className="tone-dark relative h-[100svh] min-h-[680px] overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <img src={withBase("/images/office.jpg")} alt="SEU Development office" className="h-full w-full object-cover" />
        </div>
        <div className="sunbeams sunbeams--soft" />
        <div className="absolute inset-0 bg-gradient-to-b from-seu-ink/95 via-seu-ink/50 to-seu-bg" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1680px] flex-col justify-between px-gutter pb-16 pt-44">
          <div>
            <p className="eyebrow mb-8">The company&apos;s team</p>
            <h1 className="page-title" data-split>
              SEU Development<span className="text-seu-accent-hi">.</span>
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3" aria-label="About sections" data-stagger>
            {CHIPS.map((c) => (
              <a key={c.href} href={c.href} className="btn btn-glass">
                Our {c.label.toLowerCase()}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <Section id="mission" tone="light">
        <Container>
          <SectionHeader index="01" eyebrow="What drives us" title="Our mission" />
          <div className="mt-20 grid gap-10 md:grid-cols-2" data-stagger>
            {MISSION.map((p, i) => (
              <p key={p.slice(0, 20)} className={i === 0 ? "lead" : "body-copy"}>
                {p}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="team" tone="dark" className="overflow-hidden">
        <Container className="grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col">
            <SectionHeader index="02" eyebrow="Meet our leaders" title="Our team" className="lg:grid-cols-1" />
            <p className="body-copy mt-auto max-w-sm pt-12">
              Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University,
              which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi.
            </p>
            <p className="mt-6 text-[12px] text-seu-muted">Portraits and names are illustrative for this concept.</p>
          </div>
          <div className="-mr-gutter flex snap-x gap-6 overflow-x-auto pb-4 pr-gutter" data-cursor="drag" tabIndex={0} aria-label="Team, scroll horizontally">
            {TEAM.map((m) => (
              <figure key={m.id} className="card group w-[280px] shrink-0 snap-start overflow-hidden p-0">
                <div className="overflow-hidden">
                  <img src={withBase(m.photo)} alt={`${m.name}, ${m.role}`} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <figcaption className="p-5">
                  <p className="title-m text-[22px]">{m.name}</p>
                  <p className="field-label mb-0 mt-2">{m.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>

      <Hiring />

      <div id="partners">
        <Partners variant="grid" subtitle="80+ partners trust us" />
      </div>
      <ContactSection />
    </main>
  );
}
