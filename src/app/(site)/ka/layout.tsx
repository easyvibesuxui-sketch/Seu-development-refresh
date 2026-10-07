import type { Metadata } from "next";

// The Georgian website (see lib/i18n): the same pages as the English one, under /ka/.
export const metadata: Metadata = {
  description: "SEU Development — საცხოვრებელი პროექტები თბილისში 2014 წლიდან.",
};

export default function GeorgianLayout({ children }: { children: React.ReactNode }) {
  return children;
}
