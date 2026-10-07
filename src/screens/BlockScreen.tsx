import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blockById, blockNameIn, varketiliBlocks } from "@/data/inventory";
import { tr, type Lang } from "@/lib/i18n";
import FloorExplorer from "@/components/project/FloorExplorer";

// Only SEU Varketili has a per-block inventory.
export const blockParams = () => varketiliBlocks.map((b) => ({ id: "varketili", block: b.id }));

export const blockMeta = (lang: Lang, block: string): Metadata => {
  const b = blockById(block);
  const t = tr(lang);
  return { title: `${b ? blockNameIn(b, lang) : t("Block", "ბლოკი")} · ${t("SEU Varketili", "SEU ვარკეთილი")}` };
};

export default function BlockScreen({ id, block }: { id: string; block: string }) {
  if (id !== "varketili" || !blockById(block)) notFound();
  return <FloorExplorer blockId={block} />;
}
