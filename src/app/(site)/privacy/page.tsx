import type { Metadata } from "next";
import PrivacyScreen, { privacyMeta } from "@/screens/PrivacyScreen";

export const metadata: Metadata = privacyMeta("en");

export default function Page() {
  return <PrivacyScreen lang="en" />;
}
