import type { Metadata } from "next";
import ApartmentScreen, { apartmentMeta, apartmentParams } from "@/screens/ApartmentScreen";

export const generateStaticParams = apartmentParams;

export async function generateMetadata({ params }: PageProps<"/apartments/[id]">): Promise<Metadata> {
  return apartmentMeta("en", (await params).id);
}

export default async function Page({ params }: PageProps<"/apartments/[id]">) {
  return <ApartmentScreen id={(await params).id} />;
}
