"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** fade-up (default) | mask (clip from bottom) | left | right */
  variant?: "up" | "mask" | "left" | "right";
  delay?: number;
} & Record<string, unknown>;

/** Adds `is-in` once the element scrolls into view; styling lives in globals.css. */
export default function Reveal({ as: Tag = "div", children, className = "", variant = "up", delay = 0, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
