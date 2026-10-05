import Link from "next/link";
import { withBase } from "@/data/projects";
import { statusText, type Unit } from "@/data/inventory";
import Icon from "./Icon";

export const statusClass: Record<Unit["status"], string> = {
  available: "bg-[var(--seu-available)] text-white",
  reserved: "bg-[var(--seu-reserved)] text-white",
  sold: "bg-[var(--seu-sold)] text-white",
};

const dot: Record<Unit["status"], string> = {
  available: "var(--seu-available)",
  reserved: "var(--seu-reserved)",
  sold: "var(--seu-sold)",
};

/**
 * Apartment tile, kept quiet: the cut-out 3D layout, the number with its status, one row of
 * facts as icons (bedrooms, size, block, floor) and the price. Sold flats stay visible for
 * context but are not links and show no price.
 */
export default function ApartmentCard({ unit, className = "" }: { unit: Unit; className?: string }) {
  const sold = unit.status === "sold";
  const facts: { icon: Parameters<typeof Icon>[0]["name"]; text: string; label: string }[] = [
    { icon: "bed", text: unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} bed`, label: "Bedrooms" },
    { icon: "area", text: `${unit.totalArea} m²`, label: "Total size" },
    { icon: "block", text: `Block ${unit.block.slice(1)}`, label: "Block" },
    { icon: "floor", text: `Floor ${unit.floor}`, label: "Floor" },
  ];

  const body = (
    <>
      <div className="relative -mx-2 -mt-2 aspect-[3/2] overflow-hidden rounded-[18px] bg-[radial-gradient(80%_70%_at_50%_45%,rgb(246_241_232/0.08),transparent_70%)]">
        <img
          src={withBase("/images/apartment-3d.webp")}
          alt=""
          loading="lazy"
          className={`h-full w-full object-contain p-3 transition-transform duration-700 ${sold ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="title-m text-[20px]">
          <span className="sr-only">Apartment </span>
          {unit.number}
        </p>
        <span className="label flex items-center gap-2 text-[12px] uppercase tracking-[0.12em]">
          {sold ? <Icon name="lock" size={14} /> : <span className="h-2 w-2 rounded-full" style={{ background: dot[unit.status] }} />}
          {statusText[unit.status]}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-seu-line pt-4 text-[13px]">
        {facts.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5">
            <dt className="shrink-0">
              <Icon name={f.icon} size={16} className="text-seu-accent-hi" />
              <span className="sr-only">{f.label}</span>
            </dt>
            <dd className="label whitespace-nowrap">{f.text}</dd>
          </div>
        ))}
      </dl>
      {!sold && (
        <p className="mt-4 flex items-baseline justify-between">
          <span className="title-m text-[18px]">${unit.price.toLocaleString("en-US")}</span>
          {unit.discounted ? (
            <span className="tag border-transparent bg-seu-accent text-white">−5%</span>
          ) : (
            <span className="text-[12px] text-seu-muted">${unit.pricePerM2}/m²</span>
          )}
        </p>
      )}
    </>
  );

  return sold ? (
    <div aria-label={`Apartment ${unit.number}, sold`} role="group" className={`card is-sold cursor-not-allowed opacity-70 ${className}`}>
      {body}
    </div>
  ) : (
    <Link href={`/apartments/${unit.id}/`} className={`card group ${className}`}>
      {body}
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="tag tag-solid">{children}</span>;
}
