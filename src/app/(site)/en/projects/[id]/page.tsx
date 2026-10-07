import type { Metadata } from "next";
import ProjectScreen, { projectMeta, projectParams } from "@/screens/ProjectScreen";

export const generateStaticParams = projectParams;

export async function generateMetadata({ params }: PageProps<"/en/projects/[id]">): Promise<Metadata> {
  return projectMeta("en", (await params).id);
}

export default async function Page({ params }: PageProps<"/en/projects/[id]">) {
  return <ProjectScreen lang="en" id={(await params).id} />;
}
