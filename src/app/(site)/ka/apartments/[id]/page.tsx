import type { Metadata } from "next";
import ApartmentScreen, { apartmentMeta, apartmentParams } from "@/screens/ApartmentScreen";

export const generateStaticParams = apartmentParams;

export async function generateMetadata({ params }: PageProps<"/ka/apartments/[id]">): Promise<Metadata> {
  return apartmentMeta("ka", (await params).id);
}

export default async function Page({ params }: PageProps<"/ka/apartments/[id]">) {
  return <ApartmentScreen id={(await params).id} />;
}
