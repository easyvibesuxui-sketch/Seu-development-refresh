import Link from "next/link";
import { statusLabel, withBase, type Project } from "@/data/projects";

/** Project tile used on listings: image that opens from a window, status, name, key facts. */
export default function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  return (
    <article className="group relative">
      <Link href={`/projects/${project.id}/`} className="block focus-visible:outline-none" aria-labelledby={`pc-${project.id}`}>
        <div className={`relative overflow-hidden rounded-[24px] ${wide ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/3]"}`} data-window>
          <div className="absolute inset-0" data-zoom>
            <img
              src={withBase(project.image)}
              alt=""
              style={{ objectPosition: project.imagePosition }}
              className="h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-seu-ink/80 via-transparent to-transparent" />
          <span className="btn btn-glass btn-icon absolute right-6 top-6 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L13 3M5 3h8v8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <div className="absolute inset-x-6 bottom-6 text-white md:inset-x-8 md:bottom-8">
            <p className="eyebrow text-white/85 [--muted:rgb(255_255_255/0.85)]">
              {statusLabel[project.status]} · {project.date}
            </p>
            <h3 id={`pc-${project.id}`} className={`mt-3 ${wide ? "section-title" : "title-m"}`}>
              {project.name}
            </h3>
          </div>
        </div>
      </Link>
      <dl className="mt-5 flex gap-8 text-[14px]">
        <div>
          <dt className="text-seu-muted">Location</dt>
          <dd className="mt-1">{project.district}</dd>
        </div>
        <div>
          <dt className="text-seu-muted">Apartments</dt>
          <dd className="mt-1">
            {project.sizes[0]}–{project.sizes[1]} m²
          </dd>
        </div>
        <div>
          <dt className="text-seu-muted">Floors</dt>
          <dd className="mt-1">{project.floors}</dd>
        </div>
      </dl>
    </article>
  );
}
