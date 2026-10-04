import Link from "next/link";
import { withBase } from "@/data/projects";
import { blockById, statusText, type Unit } from "@/data/inventory";

export const statusClass: Record<Unit["status"], string> = {
  available: "bg-[#0e8f5c]",
  reserved: "bg-[#1690a8]",
  sold: "bg-[#a3173f]",
};

/** Apartment tile from the design: number, 3D layout, project/block chips, status and size. */
export default function ApartmentCard({ unit, className = "" }: { unit: Unit; className?: string }) {
  const block = blockById(unit.block);
  return (
    <Link
      href={`/apartments/${unit.id}/`}
      className={`group flex flex-col rounded-md border border-white/25 bg-[#313b38] p-5 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-seu-accent-hi ${className}`}
    >
      <p className="title-display text-[clamp(18px,1.5vw,22px)] uppercase tracking-[0.04em]">
        Apartment <span className="ml-1">{unit.number}</span>
      </p>
      <div className="relative my-3 aspect-[36/25] overflow-hidden">
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
        <span className={`label rounded px-3 py-0.5 tracking-[0.04em] ${statusClass[unit.status]}`}>{statusText[unit.status]}</span>
        <span className="label flex items-center gap-1.5 rounded border border-white/60 px-2 py-0.5">
          <BedIcon /> {unit.bedrooms === 0 ? "Studio" : unit.bedrooms}
        </span>
        <span className="label flex items-center gap-1.5 rounded border border-white/60 px-2 py-0.5">
          <AreaIcon /> {unit.totalArea} m²
        </span>
        {unit.discounted && <span className="label rounded bg-seu-accent px-2 py-0.5">−5%</span>}
      </div>
    </Link>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="label rounded bg-seu-cream px-3 py-1 text-[12px] uppercase tracking-[0.06em] text-[#15201d]">{children}</span>
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
