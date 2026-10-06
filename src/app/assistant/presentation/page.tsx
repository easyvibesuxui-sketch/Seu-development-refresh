import type { Metadata } from "next";
import { Suspense } from "react";
import AssistantPresentation from "@/components/assistant/AssistantPresentation";

export const metadata: Metadata = { title: "Apartment presentation", robots: { index: false } };

// The assistant's own printable presentation: one page, the flat chosen by `?id=`, in `?lang=`.
export default function AssistantPresentationPage() {
  return (
    <Suspense>
      <AssistantPresentation />
    </Suspense>
  );
}
