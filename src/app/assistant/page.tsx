import type { Metadata } from "next";
import AssistantPlaceholder from "@/components/assistant/AssistantPlaceholder";

export const metadata: Metadata = { title: "Virtual assistant" };

// The assistant's own room, outside the website's header and footer. A placeholder for now.
export default function AssistantPage() {
  return <AssistantPlaceholder />;
}
