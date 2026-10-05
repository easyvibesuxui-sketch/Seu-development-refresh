import type { ElementType, ReactNode } from "react";

type Tone = "dark" | "light";

/**
 * Every content block of the site sits in one of these: a tone (dark forest or light paper),
 * the shared gutter, and the shared vertical rhythm. `flush` drops the vertical padding for
 * full-bleed media sections.
 */
export function Section({
  as: Tag = "section",
  tone = "dark",
  flush = false,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: Tone;
  flush?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag data-tone={tone} className={`tone-${tone} relative ${flush ? "" : "py-section"} ${className}`} {...rest}>
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
