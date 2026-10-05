import type { Metadata } from "next";
import ContactSection from "@/components/home/ContactSection";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Talk to us"
        title="Contact"
        intro="Leave your number and a sales manager will call you back, or visit our office in Saburtalo."
      />
      <ContactSection split />
    </main>
  );
}
