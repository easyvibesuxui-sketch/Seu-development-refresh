import type { Metadata } from "next";
import "@fontsource-variable/urbanist";
import "@fontsource-variable/sofia-sans-semi-condensed";
import "./globals.css";
import ScrollFX from "@/components/motion/ScrollFX";
import Cursor from "@/components/motion/Cursor";

export const metadata: Metadata = {
  title: { default: "SEU Development", template: "%s · SEU Development" },
  description: "SEU Development — residential projects in Tbilisi since 2014.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <ScrollFX />
        <Cursor />
      </body>
    </html>
  );
}
