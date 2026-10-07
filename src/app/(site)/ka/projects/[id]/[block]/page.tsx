import type { Metadata } from "next";
import BlockScreen, { blockMeta, blockParams } from "@/screens/BlockScreen";

export const generateStaticParams = blockParams;

export async function generateMetadata({ params }: PageProps<"/ka/projects/[id]/[block]">): Promise<Metadata> {
  return blockMeta("ka", (await params).block);
}

export default async function Page({ params }: PageProps<"/ka/projects/[id]/[block]">) {
  return <BlockScreen id={(await params).id} block={(await params).block} />;
}
