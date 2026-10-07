"use client";

import { usePathname } from "next/navigation";
import { langOf, localize, tr, type Lang } from "./i18n";

/** The page's language, read from its path (see i18n.ts). */
export const useLang = (): Lang => langOf(usePathname());

/** The pair picker for the page's language: t("Projects", "პროექტები"). */
export const useT = () => tr(useLang());

/** Site links in the page's language. */
export function useHref() {
  const lang = useLang();
  return (href: string) => localize(href, lang);
}
