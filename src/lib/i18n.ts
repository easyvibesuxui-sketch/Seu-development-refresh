/*
 * The website speaks Georgian at its plain paths and English under /en/ (/home/ ↔ /en/home/).
 * Each English page is its own static file, so every page is in its language before any script
 * runs. Copy sits next to its English original as a pair: t("Projects", "პროექტები").
 */

export type Lang = "en" | "ka";
export type Text = Record<Lang, string>;

/** The language a path is in (paths come without the base path). */
export const langOf = (path: string | null | undefined): Lang => (path && /^\/en(\/|$)/.test(path) ? "en" : "ka");

/** A site path in the given language (the assistant too); anything off-site keeps its address. */
export function localize(href: string, lang: Lang): string {
  const plain = href.replace(/^\/en(?=\/|$)/, "") || "/";
  // The assistant's printable presentation carries its language in `?lang=` instead.
  if (lang === "ka" || !plain.startsWith("/") || plain.startsWith("/assistant/presentation")) return plain;
  return plain === "/" ? "/en/" : `/en${plain}`;
}

/** Pick the English or Georgian of a pair. */
export const tr =
  (lang: Lang) =>
  (en: string, ka: string): string =>
    lang === "ka" ? ka : en;
