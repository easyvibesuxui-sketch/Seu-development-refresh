import type { Metadata } from "next";
import { tr, type Lang } from "@/lib/i18n";
import ContactSection from "@/components/home/ContactSection";
import PageHero from "@/components/ui/PageHero";

export const contactMeta = (lang: Lang): Metadata => ({ title: tr(lang)("Contact", "კონტაქტი") });

export default function ContactScreen({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <main>
      <PageHero
        eyebrow={t("Talk to us", "დაგვიკავშირდით")}
        title={t("Contact", "კონტაქტი")}
        intro={t(
          "Leave your number and a sales manager will call you back, or visit our office in Saburtalo.",
          "დატოვეთ ნომერი და გაყიდვების მენეჯერი დაგირეკავთ, ან გვეწვიეთ ოფისში საბურთალოზე.",
        )}
      />
      <ContactSection split />
    </main>
  );
}
