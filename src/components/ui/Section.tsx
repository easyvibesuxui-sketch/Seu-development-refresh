import type { ElementType, ReactNode } from "react";
import LogoLines from "@/components/brand/LogoLines";
import LightStreak from "./LightStreak";

type Tone = "dark" | "light";

/**
 * Every content block of the site sits in one of these: a tone (dark forest or light paper),
 * the shared gutter, and the shared vertical rhythm. `flush` drops the vertical padding for
 * full-bleed media sections. Behind the content runs the SEU mark in the faintest hairlines
 * (right on dark blocks, left on light ones), warming a little around the pointer;
 * `pattern="none"` leaves a block plain.
 */
export function Section({
  as: Tag = "section",
  tone = "dark",
  flush = false,
  className = "",
  pattern,
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: Tone;
  flush?: boolean;
  className?: string;
  pattern?: "left" | "right" | "none";
  children: ReactNode;
} & Record<string, unknown>) {
  const side = pattern ?? (flush ? "none" : tone === "dark" ? "right" : "left");
  return (
    <Tag data-tone={tone} className={`tone-${tone} relative isolate ${flush ? "" : "py-section"} ${className}`} {...rest}>
      {side !== "none" && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(100%,110svh)] overflow-hidden">
          <LogoLines tone={tone} x={side === "right" ? 0.82 : 0.18} size={0.8} />
        </div>
      )}
      {children}
    </Tag>
  );
}

/** Gutter-aligned content column, capped so lines never run across a 4K screen. */
export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1680px] px-gutter ${className}`}>{children}</div>;
}

/** One line of a spread title: where it sits across the width, and whether it carries the copper accent. */
export type SpreadLine = { text: string; at?: "start" | "center" | "end"; accent?: boolean };

/**
 * Section opening used on every page: an eyebrow with its index, the display title (the
 * full stop in the accent colour, as in the brand), and an optional intro and action
 * aligned to the right on wide screens.
 *
 * With `spread`, the title is set the way era.estate sets its own: very large and light,
 * its lines pushed to either side of the column, one of them in the copper gradient, and a
 * streak of light drawn through it as it arrives. `title` then only names it for the index.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  action,
  as: Heading = "h2",
  size = "section",
  spread,
  className = "",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
  as?: ElementType;
  size?: "section" | "page";
  spread?: SpreadLine[];
  className?: string;
}) {
  if (spread)
    return (
      <header className={`relative ${className}`}>
        {(eyebrow || index) && (
          <p className="eyebrow mb-8 md:mb-12">
            {index && <span className="text-seu-accent-hi">{index}</span>}
            {eyebrow}
          </p>
        )}
        <div className="relative">
          <Heading className="spread-title" aria-label={title} data-split>
            {spread.map((l, i) => (
              <span key={i} aria-hidden className={`spread-title__line spread-title__line--${l.at ?? "start"} ${l.accent ? "text-copper" : ""}`}>
                {l.text}
              </span>
            ))}
          </Heading>
          <LightStreak />
        </div>
        {(intro || action) && (
          <div className="mt-14 flex flex-col items-start gap-8 md:mt-20 lg:ml-auto lg:max-w-[46ch]" data-stagger>
            {intro && <div className="lead">{intro}</div>}
            {action}
          </div>
        )}
      </header>
    );
  return (
    <header className={`grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end ${className}`}>
      <div>
        {(eyebrow || index) && (
          <p className="eyebrow mb-8">
            {index && <span className="text-seu-accent-hi">{index}</span>}
            {eyebrow}
          </p>
        )}
        <Heading className={size === "page" ? "page-title" : "section-title"} data-split>
          {title}
          <span className="text-seu-accent-hi">.</span>
        </Heading>
      </div>
      {(intro || action) && (
        <div className="flex flex-col items-start gap-8 lg:pb-3" data-stagger>
          {intro && <div className="lead max-w-[46ch]">{intro}</div>}
          {action}
        </div>
      )}
    </header>
  );
}
