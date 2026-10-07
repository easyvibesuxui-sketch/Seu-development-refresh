import type { Metadata } from "next";
import { apartmentParams, presentationMeta, PresentationScreen } from "@/screens/ApartmentScreen";

export const generateStaticParams = apartmentParams;

export async function generateMetadata({ params }: PageProps<"/en/apartments/[id]/presentation">): Promise<Metadata> {
  return presentationMeta("en", (await params).id);
}

export default async function Page({ params }: PageProps<"/en/apartments/[id]/presentation">) {
  return <PresentationScreen lang="en" id={(await params).id} />;
}
