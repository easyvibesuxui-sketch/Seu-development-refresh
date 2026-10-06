import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roomText, unitById, units } from "@/data/inventory";
import ApartmentPresentation from "@/components/apartment/ApartmentPresentation";

/* The apartment's printable presentation (see ApartmentPresentation). */
export function generateStaticParams() {
  // Sold flats have no page: they are closed to buyers.
  return units.filter((u) => u.status !== "sold").map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: PageProps<"/apartments/[id]/presentation">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Apartment ${unitById(id)?.number ?? ""} presentation` };
}

export default async function PresentationPage({ params }: PageProps<"/apartments/[id]/presentation">) {
  const { id } = await params;
  const unit = unitById(id);
  if (!unit || unit.status === "sold") notFound();

  return <ApartmentPresentation unit={unit} rooms={roomText} />;
}
