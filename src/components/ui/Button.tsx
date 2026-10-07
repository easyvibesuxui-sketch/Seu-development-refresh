"use client";

import Link from "next/link";
import { useHref } from "@/lib/useLang";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost" | "light" | "glass";
type Size = "sm" | "md" | "lg" | "icon";

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

const classes = ({ variant = "primary", size = "md", className = "" }: Omit<Common, "children">) =>
  ["btn", variant !== "ghost" && `btn-${variant}`, size !== "md" && `btn-${size}`, className].filter(Boolean).join(" ");

/** The one button of the site: a pill whose fill sweeps in from the left on hover and focus. */
export function Button({ variant, size, className, type = "button", ...rest }: Common & ComponentPropsWithoutRef<"button">) {
  return <button type={type} className={classes({ variant, size, className })} {...rest} />;
}

/** Same look for navigation: internal routes use Next links (in the page's language), everything else a plain anchor. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  ...rest
}: Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const h = useHref();
  const cls = classes({ variant, size, className });
  if (href.startsWith("/")) return <Link href={h(href)} className={cls} {...rest} />;
  return <a href={href} className={cls} {...rest} />;
}
