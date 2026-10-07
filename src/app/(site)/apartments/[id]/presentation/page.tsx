import type { Metadata } from "next";
import { apartmentParams, presentationMeta, PresentationScreen } from "@/screens/ApartmentScreen";

export const generateStaticParams = apartmentParams;

export async function generateMetadata({ params }: PageProps<"/apartments/[id]/presentation">): Promise<Metadata> {
  return presentationMeta("ka", (await params).id);
}

export default async function Page({ params }: PageProps<"/apartments/[id]/presentation">) {
  return <PresentationScreen lang="ka" id={(await params).id} />;
}
