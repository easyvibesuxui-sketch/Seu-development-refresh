import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roomsIn, unitById, units } from "@/data/inventory";
import { tr, type Lang } from "@/lib/i18n";
import ApartmentView from "@/components/apartment/ApartmentView";
import ApartmentPresentation from "@/components/apartment/ApartmentPresentation";

// Sold flats have no page: they are closed to buyers.
export const apartmentParams = () => units.filter((u) => u.status !== "sold").map((u) => ({ id: u.id }));

export const apartmentMeta = (lang: Lang, id: string): Metadata => {
  const unit = unitById(id);
  return { title: unit ? tr(lang)(`Apartment ${unit.number}`, `ბინა ${unit.number}`) : tr(lang)("Apartment", "ბინა") };
};

export const presentationMeta = (lang: Lang, id: string): Metadata => ({
  title: tr(lang)(`Apartment ${unitById(id)?.number ?? ""} presentation`, `ბინა ${unitById(id)?.number ?? ""} — პრეზენტაცია`),
});

const openUnit = (id: string) => {
  const unit = unitById(id);
  if (!unit || unit.status === "sold") notFound();
  return unit;
};

export default function ApartmentScreen({ id }: { id: string }) {
  return <ApartmentView unit={openUnit(id)} />;
}

/** The apartment's printable presentation (see ApartmentPresentation). */
export function PresentationScreen({ lang, id }: { lang: Lang; id: string }) {
  return <ApartmentPresentation unit={openUnit(id)} lang={lang} rooms={roomsIn(lang)} />;
}
