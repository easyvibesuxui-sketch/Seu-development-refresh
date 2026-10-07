/*
 * The website speaks English at its plain paths and Georgian under /ka/ (/home/ ↔ /ka/home/).
 * Each Georgian page is its own static file, so it is Georgian before any script runs. Copy
 * sits next to its English original as a pair: t("Projects", "პროექტები").
 */

export type Lang = "en" | "ka";
export type Text = Record<Lang, string>;

/** The language a path is in (paths come without the base path). */
export const langOf = (path: string | null | undefined): Lang => (path && /^\/ka(\/|$)/.test(path) ? "ka" : "en");

/** A site path in the given language (the assistant too); anything off-site keeps its address. */
export function localize(href: string, lang: Lang): string {
  const plain = href.replace(/^\/ka(?=\/|$)/, "") || "/";
  // The assistant's printable presentation carries its language in `?lang=` instead.
  if (lang === "en" || !plain.startsWith("/") || plain.startsWith("/assistant/presentation")) return plain;
  return plain === "/" ? "/ka/" : `/ka${plain}`;
}

/** Pick the English or Georgian of a pair. */
export const tr =
  (lang: Lang) =>
  (en: string, ka: string): string =>
    lang === "ka" ? ka : en;
