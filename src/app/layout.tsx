import type { Metadata } from "next";
import "@fontsource-variable/urbanist";
import "@fontsource-variable/sofia-sans-semi-condensed";
import "@fontsource-variable/noto-sans-georgian";
import "./globals.css";
import ScrollFX from "@/components/motion/ScrollFX";
import Cursor from "@/components/motion/Cursor";

export const metadata: Metadata = {
  title: { default: "SEU Development", template: "%s · SEU Development" },
  description: "SEU Development — საცხოვრებელი პროექტები თბილისში 2014 წლიდან.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // English pages live under /en/: the page's language is set before it paints (see lib/i18n).
    <html lang="ka" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if(/\\/en(\\/|$)/.test(location.pathname))document.documentElement.lang="en"` }} />
      </head>
      <body className="min-h-full">
        {children}
        <ScrollFX />
        <Cursor />
      </body>
    </html>
  );
}
