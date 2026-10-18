import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { tr, type Lang } from "@/lib/i18n";
import PageHero from "@/components/ui/PageHero";
import ProjectCard from "@/components/ui/ProjectCard";
import { Container, Section } from "@/components/ui/Section";

export const projectsMeta = (lang: Lang): Metadata => ({ title: tr(lang)("Choose project", "აირჩიეთ პროექტი") });

const groups = [
  { status: "ongoing", index: "01", eyebrow: ["Under construction", "მშენებლობის პროცესში"], title: ["Ongoing", "მიმდინარე"] },
  { status: "upcoming", index: "02", eyebrow: ["Starting soon", "მალე დაიწყება"], title: ["Upcoming", "მომავალი"] },
  { status: "finished", index: "03", eyebrow: ["Delivered", "ჩაბარებული"], title: ["Finished", "დასრულებული"] },
] as const;

export default function ProjectsScreen({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <main>
      <PageHero
        eyebrow={t("Portfolio", "პორტფოლიო")}
        title={t("Choose project", "აირჩიეთ პროექტი")}
        intro={t(
          "Every SEU project is fully funded from the start of construction, so each one is delivered on time.",
          "SEU-ს ყველა პროექტი მშენებლობის დაწყებიდანვე სრულად დაფინანსებულია, ამიტომ თითოეული დროულად სრულდება.",
        )}
      />
      {groups.map((g, gi) => {
        const list = projects.filter((p) => p.status === g.status);
        return (
          // The first list follows the page title on the same tone, so it starts close under it.
          <Section key={g.status} tone={gi === 1 ? "light" : "dark"} className={gi === 0 ? "!pt-4 md:!pt-8" : ""}>
            <Container>
              {/* A listing label, quieter than the page title: number, name, count, a rule. */}
              <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-seu-line pb-6">
                <div>
                  <p className="eyebrow mb-3">
                    <span className="text-seu-accent-hi">{g.index}</span>
                    {t(g.eyebrow[0], g.eyebrow[1])}
                  </p>
                  <h2 className="title-m text-[clamp(26px,2.6vw,40px)]">{t(g.title[0], g.title[1])}</h2>
                </div>
                <p className="label text-[13px] text-seu-muted">
                  {list.length} {t(list.length === 1 ? "project" : "projects", "პროექტი")}
                </p>
              </header>
              <div className={`mt-10 grid gap-x-8 gap-y-16 md:mt-12 ${list.length > 1 ? "md:grid-cols-2" : ""}`} data-stagger>
                {list.map((p) => (
                  <ProjectCard key={p.id} project={p} wide={list.length === 1} />
                ))}
              </div>
            </Container>
          </Section>
        );
      })}
    </main>
  );
}
