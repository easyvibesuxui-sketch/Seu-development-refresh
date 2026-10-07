import type { Metadata } from "next";
import Gate from "@/components/gate/Gate";

export const metadata: Metadata = { description: "SEU Development — საცხოვრებელი პროექტები თბილისში 2014 წლიდან." };

// The entrance in Georgian: the assistant, or the website at /ka/home/.
export default function GatePage() {
  return <Gate />;
}
