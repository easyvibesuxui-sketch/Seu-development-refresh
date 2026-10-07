import type { Metadata } from "next";
import ProjectsScreen, { projectsMeta } from "@/screens/ProjectsScreen";

export const metadata: Metadata = projectsMeta("en");

export default function Page() {
  return <ProjectsScreen lang="en" />;
}
