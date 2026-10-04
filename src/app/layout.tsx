import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/jost";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEU Development",
  description: "SEU Development — residential projects in Tbilisi since 2014.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
