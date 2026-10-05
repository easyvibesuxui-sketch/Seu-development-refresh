import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Privacy policy" };

// English rendering of the policy published on seudevelopment.ge (Georgian original in docs/audit/content/policy-ka.txt).
const SECTIONS = [
  {
    title: null,
    body: [
      "This website, www.seudevelopment.ge (the \"Website\"), is the property of SEU Group Development Company LLC (ID 405062836). The trust of our customers and the privacy of their personal space are a priority for our company. This document explains how SEU Group Development Company LLC ensures the security and confidentiality of the information you provide, in accordance with applicable law.",
    ],
  },
  {
    title: "What information do we collect?",
    body: [
      "When you visit our website, data is collected in the following ways:",
      "Active communication: when you use the \"leave your number\" feature, we store your contact number in order to get in touch with you and send you offers that may interest you.",
      "Analytics: we record which source you came to the website from, how long you spent on a particular page and which products you were interested in. This helps us improve the quality of our service.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You have full control over your personal data and the right to:",
      "request information about how your data is processed;",
      "request the correction of incorrect or inaccurate data;",
      "request the deletion of your data or the termination of its processing.",
      "Note: the company will respond to any request within 30 working days.",
    ],
  },
  {
    title: "Data security and retention",
    body: [
      "The company uses modern technical and organisational measures to protect your information. Data is kept only for as long as necessary to improve the service and to achieve marketing purposes. Once the purpose is achieved, or at your request, the information is securely deleted.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHero eyebrow="Last updated · 2026" title="Privacy policy" intro="How SEU Development collects, uses and protects the information you share with us." />
      <Section tone="light">
        <Container>
          <div className="mx-auto max-w-[68ch] space-y-16">
            {SECTIONS.map((s, i) => (
              <div key={i} data-stagger>
                {s.title && <h2 className="title-m mb-6">{s.title}</h2>}
                {s.body.map((p) => (
                  <p key={p.slice(0, 24)} className="mb-4 text-[17px] leading-[1.8]">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
