"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./FilterPanel.module.css";

const BEDROOMS = [1, 2, 3, 4, 5, 6];

export default function FilterPanel({ className = "" }: { className?: string }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bedrooms, setBedrooms] = useState<number[]>([]);
  const router = useRouter();

  const toggle = (n: number) =>
    setBedrooms((current) => (current.includes(n) ? current.filter((b) => b !== n) : [...current, n]));

  const reset = () => {
    setFrom("");
    setTo("");
    setBedrooms([]);
  };

  return (
    <form
      className={`${styles.panel} ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const r = bedrooms.length ? `&rooms=${Math.min(Math.min(...bedrooms), 3)}` : "";
        router.push(`/search/?project=varketili${r}`);
      }}
    >
      <p className={styles.heading}>
        <SearchIcon /> Choose apartment
      </p>

      <fieldset className={styles.group}>
        <legend>Size m²</legend>
        <div className={styles.range}>
          <label>
            <span>From</span>
            <input inputMode="numeric" placeholder="0" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            <span>To</span>
            <input inputMode="numeric" placeholder="250+" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Bedrooms</legend>
        <div className={styles.bedrooms}>
          {BEDROOMS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={bedrooms.includes(n)}
              className={styles.bedroom}
              onClick={() => toggle(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className={styles.search}>
          Search
        </button>
        <button type="button" className={styles.reset} onClick={reset}>
          <ResetIcon /> Reset
        </button>
      </div>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" />
      <path d="M11 11l4 4" stroke="currentColor" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" opacity=".5" />
      <path d="M11 8a3 3 0 1 1-1-2.2M10 3.5v2.4h-2.4" stroke="currentColor" />
    </svg>
  );
}
