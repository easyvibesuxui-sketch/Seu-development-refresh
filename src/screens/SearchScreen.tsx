import type { Metadata } from "next";
import { Suspense } from "react";
import { tr, type Lang } from "@/lib/i18n";
import ApartmentSearch from "@/components/search/ApartmentSearch";

export const searchMeta = (lang: Lang): Metadata => ({ title: tr(lang)("Apartments", "ბინები") });

// useSearchParams needs a Suspense boundary in a static export.
export default function SearchScreen() {
  return (
    <Suspense>
      <ApartmentSearch />
    </Suspense>
  );
}
