import type { Metadata } from "next";
import ContactScreen, { contactMeta } from "@/screens/ContactScreen";

export const metadata: Metadata = contactMeta("ka");

export default function Page() {
  return <ContactScreen lang="ka" />;
}
