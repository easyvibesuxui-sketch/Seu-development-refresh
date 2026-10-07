import type { Metadata } from "next";
import AssistantExperience from "@/components/assistant/AssistantExperience";

export const metadata: Metadata = { title: "ვირტუალური ასისტენტი" };

// The assistant in Georgian: the same showroom, its language read from the path.
export default function AssistantPage() {
  return <AssistantExperience />;
}
