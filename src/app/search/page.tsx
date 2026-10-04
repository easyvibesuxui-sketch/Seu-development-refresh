import type { Metadata } from "next";
import { Suspense } from "react";
import ApartmentSearch from "@/components/search/ApartmentSearch";

export const metadata: Metadata = { title: "Apartments" };

// useSearchParams needs a Suspense boundary in a static export.
export default function SearchPage() {
  return (
    <Suspense>
      <ApartmentSearch />
    </Suspense>
  );
}
