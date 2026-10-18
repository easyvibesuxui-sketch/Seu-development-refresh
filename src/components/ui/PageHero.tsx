import type { ReactNode } from "react";
import BackLink from "./BackLink";
import { Container, Section } from "./Section";

/**
 * Opening of every text-led inner page: optional back link, eyebrow, the page title (h1) with
 * the accent full stop, and an intro to its right on wide screens. Generous top space keeps
 * clear of the floating header.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  back,
  tone = "dark",
  titleClassName = "",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  back?: { href: string; label?: string };
  tone?: "dark" | "light";
  /** Extra classes for the title, e.g. a smaller size for a very long word. */
  titleClassName?: string;
  children?: ReactNode;
}) {
  return (
    <Section tone={tone} data-page-hero className="overflow-hidden pb-20 pt-44 md:pb-32 md:pt-52">
      <Container className="relative">
        {back && (
          <div className="mb-14">
            <BackLink href={back.href} label={back.label} />
          </div>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end">
          {/* The title sizes itself to this column (container units), so long words never overflow. */}
          <div className="[container-type:inline-size]">
            <p className="eyebrow mb-8">{eyebrow}</p>
            <h1 className={`page-title ${titleClassName}`} data-split>
              {title}
              <span className="text-seu-accent-hi">.</span>
            </h1>
          </div>
          {intro && <div className="lead max-w-[46ch] text-seu-muted lg:pb-4">{intro}</div>}
        </div>
        {children}
      </Container>
    </Section>
  );
}
