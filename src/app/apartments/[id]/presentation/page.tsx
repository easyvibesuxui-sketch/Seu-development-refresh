import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withBase } from "@/data/projects";
import { roomText, unitById, units } from "@/data/inventory";
import LogoMark from "@/components/brand/LogoMark";
import PrintButton from "@/components/apartment/PrintButton";

/*
 * Printable two-page A4 apartment presentation, laid out after the developer's PDF template
 * (docs/design/apartment-profile-template.pdf). "Download PDF" uses the browser's print-to-PDF.
 */
export function generateStaticParams() {
  // Sold flats have no page: they are closed to buyers.
  return units.filter((u) => u.status !== "sold").map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: PageProps<"/apartments/[id]/presentation">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Apartment ${unitById(id)?.number ?? ""} presentation` };
}

export default async function PresentationPage({ params }: PageProps<"/apartments/[id]/presentation">) {
  const { id } = await params;
  const unit = unitById(id);
  if (!unit || unit.status === "sold") notFound();

  return (
    <div className="presentation">
      <div className="pres-toolbar">
        <PrintButton />
      </div>

      <section className="pres-page pres-cover" style={{ backgroundImage: `url(${withBase("/images/presentation-cover.jpg")})` }}>
        <div className="pres-card">
          <LogoMark className="w-40" />
          <p className="pres-serif mt-10 text-[54px] leading-none">SEU</p>
          <p className="pres-serif mt-4 text-[34px]">Development</p>
          <p className="mt-20 text-[13px] uppercase leading-relaxed tracking-[0.08em]">
            European residential
            <br />
            complex
          </p>
          <p className="mt-8 text-[20px]">SEU Varketili</p>
        </div>
      </section>

      <section className="pres-page pres-sheet">
        <div className="grid grid-cols-[1.25fr_1fr] gap-8 px-12 pt-10">
          <img src={withBase("/images/apartment-plan.png")} alt="Apartment plan" className="w-full" />
          <div className="border-l border-seu-ink pl-6">
            <div className="flex justify-end">
              <LogoMark className="w-9" />
            </div>
            <p className="text-[12px]">Apartment N</p>
            <p className="pres-serif text-[24px] leading-tight">{unit.number}</p>
            <p className="mt-5 text-[12px]">Block</p>
            <p className="pres-serif text-[18px] leading-tight">{unit.block.slice(1)}</p>
            <p className="mt-4 text-[12px]">Floor</p>
            <p className="pres-serif text-[18px] leading-tight">{unit.floor}</p>
            <div className="mt-6 h-[2px] bg-[#2b3a45]" />
            <ul className="mt-4 space-y-3 text-[10px]">
              {unit.rooms.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{roomText[r.kind]}</span>
                  <span>{r.area} m²</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-seu-ink/20 pt-3 font-semibold">
                <span>Total</span>
                <span>{unit.totalArea} m²</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 bg-[#1b2120] px-24 pb-12 pt-8 text-center text-white">
          <p className="pres-serif text-[22px]">Floor Plan</p>
          <div className="mt-6 grid grid-cols-4 gap-1 bg-white p-4">
            {Array.from({ length: 7 }, (_, slot) => (
              <img
                key={slot}
                src={withBase("/images/apartment-plan.png")}
                alt=""
                className={`w-full ${slot === unit.slot ? "[filter:invert(48%)_sepia(32%)_saturate(700%)_hue-rotate(340deg)]" : "opacity-25"} ${slot >= 4 ? "translate-x-1/2" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 px-12 pt-10 text-[12px]">
          <div>
            <p className="text-seu-ink/70">Interested? Contact us</p>
            <p className="pres-serif mt-4 text-[11px]">+995 596 70 70 70</p>
            <p className="pres-serif mt-3 text-[11px]">info@seudevelopment.ge</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.06em] text-seu-ink/70">Sales office address</p>
            <p className="pres-serif mt-4 text-[11px]">Anna Politkovskaya 32, Tbilisi</p>
          </div>
        </div>
      </section>
    </div>
  );
}
