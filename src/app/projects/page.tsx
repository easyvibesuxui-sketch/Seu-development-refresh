import type { Metadata } from "next";
import { projects } from "@/data/projects";
import PageHero from "@/components/ui/PageHero";
import ProjectCard from "@/components/ui/ProjectCard";
import { Container, Section, SectionHeader } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Choose project" };

const groups = [
  { status: "ongoing", index: "01", eyebrow: "Under construction", title: "Ongoing" },
  { status: "upcoming", index: "02", eyebrow: "Starting soon", title: "Upcoming" },
  { status: "finished", index: "03", eyebrow: "Delivered", title: "Finished" },
] as const;

export default function ProjectsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Portfolio"
        title="Choose project"
        intro="Every SEU project is fully funded from the start of construction, so each one is delivered on time."
      />
      {groups.map((g, gi) => {
        const list = projects.filter((p) => p.status === g.status);
        return (
          <Section key={g.status} tone={gi === 1 ? "light" : "dark"}>
            <Container>
              <SectionHeader index={g.index} eyebrow={g.eyebrow} title={g.title} />
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
