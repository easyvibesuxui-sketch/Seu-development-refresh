import type { Metadata } from "next";
import Gate from "@/components/gate/Gate";

export const metadata: Metadata = { description: "SEU Development — residential projects in Tbilisi since 2014." };

// The entrance in English: the assistant, or the website at /en/home/.
export default function GatePage() {
  return <Gate />;
}
