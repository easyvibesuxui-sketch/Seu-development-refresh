import type { ReactNode } from "react";
import LogoLines from "@/components/brand/LogoLines";
import LightTrails from "@/components/motion/LightTrails";
import BackLink from "./BackLink";
import { Container, Section } from "./Section";

/**
 * Opening of every text-led inner page: optional back link, eyebrow, the page title (h1) with
 * the accent full stop, and an intro to its right on wide screens. Generous top space keeps
 * clear of the floating header. Dark heroes carry the SEU line drawing and a light orbit
 * circling the title.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  back,
  tone = "dark",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  back?: { href: string; label?: string };
  tone?: "dark" | "light";
  children?: ReactNode;
}) {
  return (
    <Section tone={tone} className="overflow-hidden pb-20 pt-44 md:pb-28 md:pt-52">
      {tone === "dark" && <LogoLines x={0.9} size={0.8} />}
      <Container className="relative">
        {back && (
          <div className="mb-14">
            <BackLink href={back.href} label={back.label} />
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end">
          {/* The orbit belongs to the title block, so it never runs behind the intro. */}
          <div className="relative isolate">
            {tone === "dark" && (
              <LightTrails preset="orbit" className="absolute -inset-x-[30%] -inset-y-[70%] -z-10 h-[240%] w-[160%]" cy={0.6} />
            )}
            <p className="eyebrow mb-8">{eyebrow}</p>
            <h1 className="page-title" data-split>
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
