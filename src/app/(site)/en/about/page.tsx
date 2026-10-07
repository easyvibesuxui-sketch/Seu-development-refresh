import type { Metadata } from "next";
import AboutScreen, { aboutMeta } from "@/screens/AboutScreen";

export const metadata: Metadata = aboutMeta("en");

export default function Page() {
  return <AboutScreen lang="en" />;
}
