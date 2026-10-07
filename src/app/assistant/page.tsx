import type { Metadata } from "next";
import AssistantExperience from "@/components/assistant/AssistantExperience";

export const metadata: Metadata = { title: "ვირტუალური ასისტენტი" };

// The assistant's showroom in Georgian, outside the website's header and footer (English: /en/assistant/).
export default function AssistantPage() {
  return <AssistantExperience />;
}
