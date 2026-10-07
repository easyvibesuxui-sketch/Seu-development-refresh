import type { Metadata } from "next";
import NewsScreen, { newsMeta } from "@/screens/NewsScreen";

export const metadata: Metadata = newsMeta("en");

export default function Page() {
  return <NewsScreen lang="en" />;
}
