import type { Metadata } from "next";
import ProjectsScreen, { projectsMeta } from "@/screens/ProjectsScreen";

export const metadata: Metadata = projectsMeta("ka");

export default function Page() {
  return <ProjectsScreen lang="ka" />;
}
