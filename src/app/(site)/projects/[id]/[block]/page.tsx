import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blockById, varketiliBlocks } from "@/data/inventory";
import FloorExplorer from "@/components/project/FloorExplorer";

// Only SEU Varketili has a per-block inventory.
export function generateStaticParams() {
  return varketiliBlocks.map((b) => ({ id: "varketili", block: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]/[block]">): Promise<Metadata> {
  const { block } = await params;
  return { title: `${blockById(block)?.name ?? "Block"} · SEU Varketili` };
}

export default async function BlockPage({ params }: PageProps<"/projects/[id]/[block]">) {
  const { id, block } = await params;
  if (id !== "varketili" || !blockById(block)) notFound();
  return <FloorExplorer blockId={block} />;
}
