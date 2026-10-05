import type { ElementType, ReactNode } from "react";
import LogoLines from "@/components/brand/LogoLines";

type Tone = "dark" | "light";

/**
 * Every content block of the site sits in one of these: a tone (dark forest or light paper),
 * the shared gutter, and the shared vertical rhythm. `flush` drops the vertical padding for
 * full-bleed media sections. Behind the content runs the SEU line drawing, as era.estate runs
 * its own mark through its pages: on the right of dark blocks and the left of light ones by
 * default, sized to the viewport; `pattern="none"` leaves a block plain.
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

/**
 * Section opening used on every page: an eyebrow with its index, the display title (the
 * full stop in the accent colour, as in the brand), and an optional intro and action
 * aligned to the right on wide screens.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  action,
  as: Heading = "h2",
  size = "section",
  className = "",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
  as?: ElementType;
  size?: "section" | "page";
  className?: string;
}) {
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
