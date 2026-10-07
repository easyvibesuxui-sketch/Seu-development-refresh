import type { Metadata } from "next";
import ProjectScreen, { projectMeta, projectParams } from "@/screens/ProjectScreen";

export const generateStaticParams = projectParams;

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  return projectMeta("ka", (await params).id);
}

export default async function Page({ params }: PageProps<"/projects/[id]">) {
  return <ProjectScreen lang="ka" id={(await params).id} />;
}
