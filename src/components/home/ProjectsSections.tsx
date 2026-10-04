import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { projects, statusLabel, withBase, type Project } from "@/data/projects";

const ongoing = projects.filter((p) => p.status === "ongoing");
const upcoming = projects.filter((p) => p.status === "upcoming");
const finished = projects.filter((p) => p.status === "finished");

export default function ProjectsSections() {
  return (
    <div id="projects">
      <section className="pb-40 pt-40">
        <h2 className="section-title px-6 md:px-12" data-split>
          Ongoing.
        </h2>
        <div className="mt-16 space-y-4">
          {ongoing.map((p) => (
            <WideProject key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section className="px-6 pb-48 md:px-12">
        <h2 className="section-title uppercase" data-split>
          Upcoming.
        </h2>
        {/* Cards meet corner to corner: the right card starts exactly where the left one ends
            (image at 2.6:1 plus the fixed-height caption), as in the design. */}
        <div className="mt-20 grid gap-y-16 [container-type:inline-size] md:grid-cols-2 md:gap-y-0">
          {upcoming.map((p, i) => (
            <div key={p.id} className={i % 2 ? "md:mt-[calc(50cqw/2.6+8rem)]" : ""}>
              <Reveal variant={i % 2 ? "right" : "left"} className="group">
                <FadedImage project={p} className="aspect-[2.6/1]" />
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <StatusLine project={p} centered />
                  <h3 className="title-display mt-1 text-[clamp(26px,2.4vw,38px)] uppercase">{p.name}</h3>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-48 md:px-12">
        <h2 className="section-title uppercase" data-split>
          Finished.
        </h2>
        <div className="mt-20 grid gap-10 md:grid-cols-2" data-stagger>
          {finished.map((p) => (
            <article key={p.id} className="group">
              <FadedImage project={p} className="aspect-[4/3]" />
              <div className="relative -mt-24 px-5">
                <StatusLine project={p} />
                <h3 className="title-display mt-1 text-[clamp(28px,2.6vw,44px)] uppercase">{p.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WideProject({ project }: { project: Project }) {
  return (
    <article className="group relative">
      <Reveal variant="mask" className="relative h-[78vh] min-h-[460px] overflow-hidden">
        <div className="absolute inset-0" data-zoom>
          <img
            src={withBase(project.image)}
            alt={`${project.name} render`}
            className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/70 via-transparent via-35% to-[#15201d]/90" />
      </Reveal>
      <div className="absolute inset-x-6 bottom-10 flex flex-wrap items-end justify-between gap-6 md:inset-x-12">
        <Reveal>
          <StatusLine project={project} />
          <h3 className="title-display mt-1 text-[clamp(40px,5vw,76px)] uppercase leading-none">{project.name}</h3>
        </Reveal>
        <Reveal delay={150} className="flex flex-wrap items-center gap-x-10 gap-y-3 text-[14px] md:text-[15px]">
          <Meta label="Location" value={project.district} />
          <Meta label="Sizes" value={`From ${project.sizes[0]} m²  To ${project.sizes[1]} m²`} />
          <Link
            href={`/projects/${project.id}/`}
            aria-label={`Explore ${project.name}`}
            className="grid h-11 w-11 place-items-center rounded bg-seu-accent transition-transform hover:scale-110"
          >
            <BuildingSearchIcon />
          </Link>
        </Reveal>
      </div>
    </article>
  );
}

function FadedImage({ project, className }: { project: Project; className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0" data-zoom>
        <img
          src={withBase(project.image)}
          alt={`${project.name} render`}
          style={{ objectPosition: project.imagePosition }}
          className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#15201d]/50 via-transparent via-30% to-[#15201d]/90" />
    </div>
  );
}

function StatusLine({ project, centered }: { project: Project; centered?: boolean }) {
  return (
    <p
      className={`flex items-center gap-2 text-[13px] tracking-[0.1em] text-seu-muted ${centered ? "justify-center" : ""}`}
    >
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
        <path d="M1 15V1h10l-2 3.5L11 8H1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      {statusLabel[project.status].toUpperCase()} <span>{project.date}</span>
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-3 whitespace-pre">
      <span className="text-seu-muted">{label}</span>
      <span className="h-2 w-2 rounded-full border border-seu-muted" />
      <span>{value}</span>
    </span>
  );
}

function BuildingSearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21V6l7-3v18M10 21h8v-7" stroke="#fff" strokeWidth="1.4" />
      <path d="M5.5 8h2M5.5 11h2M5.5 14h2M5.5 17h2" stroke="#fff" strokeWidth="1.2" />
      <circle cx="17" cy="8" r="3.2" stroke="#fff" strokeWidth="1.4" />
      <path d="M19.4 10.4L22 13" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}
