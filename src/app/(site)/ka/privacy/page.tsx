import type { Metadata } from "next";
import PrivacyScreen, { privacyMeta } from "@/screens/PrivacyScreen";

export const metadata: Metadata = privacyMeta("ka");

export default function Page() {
  return <PrivacyScreen lang="ka" />;
}
