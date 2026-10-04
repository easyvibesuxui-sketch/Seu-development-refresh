import type { Metadata } from "next";
import ProjectsSections from "@/components/home/ProjectsSections";

export const metadata: Metadata = { title: "Choose project" };

export default function ProjectsPage() {
  return (
    <main className="pt-36">
      <h1 className="title-display px-6 text-[clamp(44px,6vw,96px)] uppercase leading-none md:px-12" data-split>
        Choose project
      </h1>
      <ProjectsSections />
    </main>
  );
}
