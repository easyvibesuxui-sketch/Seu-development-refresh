import type { Metadata } from "next";
import SearchScreen, { searchMeta } from "@/screens/SearchScreen";

export const metadata: Metadata = searchMeta("en");

export default function Page() {
  return <SearchScreen />;
}
