import type { Metadata } from "next";
import CardScreen, { cardMeta } from "@/screens/CardScreen";

export const metadata: Metadata = cardMeta("ka");

export default function Page() {
  return <CardScreen lang="ka" />;
}
