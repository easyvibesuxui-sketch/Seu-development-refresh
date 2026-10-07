import type { Metadata } from "next";

// The English website (see lib/i18n): the same pages as the Georgian one, under /en/.
export const metadata: Metadata = {
  description: "SEU Development — residential projects in Tbilisi since 2014.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
