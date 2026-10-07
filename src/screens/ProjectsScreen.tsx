import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { tr, type Lang } from "@/lib/i18n";
import PageHero from "@/components/ui/PageHero";
import ProjectCard from "@/components/ui/ProjectCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

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
          <Section key={g.status} tone={gi === 1 ? "light" : "dark"}>
            <Container>
              <SectionHeader index={g.index} eyebrow={t(g.eyebrow[0], g.eyebrow[1])} title={t(g.title[0], g.title[1])} />
              <div className={`mt-20 grid gap-x-8 gap-y-20 ${list.length > 1 ? "md:grid-cols-2" : ""}`} data-stagger>
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
