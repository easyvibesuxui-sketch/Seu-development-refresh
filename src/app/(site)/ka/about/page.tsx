import type { Metadata } from "next";
import AboutScreen, { aboutMeta } from "@/screens/AboutScreen";

export const metadata: Metadata = aboutMeta("ka");

export default function Page() {
  return <AboutScreen lang="ka" />;
}
