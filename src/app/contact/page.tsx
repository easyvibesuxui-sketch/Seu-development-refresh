import type { Metadata } from "next";
import ContactSection from "@/components/home/ContactSection";

export const metadata: Metadata = { title: "Contact" };

/** Contact page: a cream diagonal sweeps in from the lower right, per the design's transition frames. */
export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden pt-16">
      <div className="contact-wedge pointer-events-none absolute inset-0 hidden bg-seu-cream md:block" aria-hidden />
      <div className="relative">
        <ContactSection split />
      </div>
    </main>
  );
}
