import type { Metadata } from "next";
import NewsScreen, { newsMeta } from "@/screens/NewsScreen";

export const metadata: Metadata = newsMeta("ka");

export default function Page() {
  return <NewsScreen lang="ka" />;
}
