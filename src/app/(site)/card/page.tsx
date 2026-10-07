import type { Metadata } from "next";
import CardScreen, { cardMeta } from "@/screens/CardScreen";

export const metadata: Metadata = cardMeta("en");

export default function Page() {
  return <CardScreen lang="en" />;
}
