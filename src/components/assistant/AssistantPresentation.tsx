"use client";

import { useSearchParams } from "next/navigation";
import { unitById, type RoomKind } from "@/data/inventory";
import { ROOM, type Lang } from "@/data/assistant";
import ApartmentPresentation from "@/components/apartment/ApartmentPresentation";

/** Reads the flat and language from the address, so one static page serves every apartment. */
export default function AssistantPresentation() {
  const params = useSearchParams();
  const lang: Lang = params.get("lang") === "en" ? "en" : "ka";
  const unit = unitById(params.get("id") ?? "");
  if (!unit || unit.status === "sold") {
    return <p className="p-10 text-center">{lang === "ka" ? "ბინა ვერ მოიძებნა." : "Apartment not found."}</p>;
  }
  const rooms = Object.fromEntries(Object.entries(ROOM).map(([k, v]) => [k, v[lang]])) as Record<RoomKind, string>;
  return <ApartmentPresentation unit={unit} lang={lang} rooms={rooms} />;
}
