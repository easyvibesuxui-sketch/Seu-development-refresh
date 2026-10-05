import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unitById, units } from "@/data/inventory";
import ApartmentView from "@/components/apartment/ApartmentView";

export function generateStaticParams() {
  // Sold flats have no page: they are closed to buyers.
  return units.filter((u) => u.status !== "sold").map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: PageProps<"/apartments/[id]">): Promise<Metadata> {
  const { id } = await params;
  const unit = unitById(id);
  return { title: unit ? `Apartment ${unit.number}` : "Apartment" };
}

export default async function ApartmentPage({ params }: PageProps<"/apartments/[id]">) {
  const { id } = await params;
  const unit = unitById(id);
  if (!unit || unit.status === "sold") notFound();
  return <ApartmentView unit={unit} />;
}
