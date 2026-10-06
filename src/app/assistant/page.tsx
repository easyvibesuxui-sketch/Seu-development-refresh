import type { Metadata } from "next";
import AssistantExperience from "@/components/assistant/AssistantExperience";

export const metadata: Metadata = { title: "Virtual assistant" };

// The assistant's showroom, outside the website's header and footer.
export default function AssistantPage() {
  return <AssistantExperience />;
}
