import Link from "next/link";
import { withBase } from "@/data/projects";
import { blockById, statusText, type Unit } from "@/data/inventory";

export const statusClass: Record<Unit["status"], string> = {
  available: "bg-[var(--seu-available)] text-white",
  reserved: "bg-[var(--seu-reserved)] text-white",
  sold: "bg-[var(--seu-sold)] text-white",
};

/** Apartment tile from the design: number, 3D layout, project/block chips, status and size. */
export default function ApartmentCard({ unit, className = "" }: { unit: Unit; className?: string }) {
  const block = blockById(unit.block);
  return (
    <Link
      href={`/apartments/${unit.id}/`}
      className={`card group ${className}`}
    >
      <p className="title-m text-[clamp(20px,1.6vw,26px)]">
        Apartment <span className="ml-1">{unit.number}</span>
      </p>
      <div className="relative my-4 aspect-[36/25] overflow-hidden rounded-[16px] bg-[#313b38]">
        <img
          src={withBase("/images/apartment-3d.png")}
          alt={`Apartment ${unit.number} layout`}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-700 group-hover:rotate-[-2deg] group-hover:scale-105"
        />
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Chip>Varketili</Chip>
        <Chip>{block?.name ?? unit.block}</Chip>
        <Chip>Floor {unit.floor}</Chip>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className={`tag border-transparent ${statusClass[unit.status]}`}>{statusText[unit.status]}</span>
        <span className="tag">
          <BedIcon /> <span className="sr-only">Bedrooms:</span> {unit.bedrooms === 0 ? "Studio" : unit.bedrooms}
        </span>
        <span className="tag">
          <AreaIcon /> {unit.totalArea} m²
        </span>
        {unit.discounted && <span className="tag border-transparent bg-seu-accent text-white">−5%</span>}
      </div>
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="tag tag-solid">{children}</span>
  );
}

function BedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 13V4M1 10h14v3M15 10V7a2 2 0 0 0-2-2H7v5M4 8h1" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1 15h14M1 15V1M4 15v-3M7 15V9M10 15v-5M13 15V5" />
    </svg>
  );
}
