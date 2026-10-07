import { withBase } from "@/data/projects";
import { PLAN, PLAN_RATIO, UNIT_SHAPES, centre } from "@/data/floorplan";
import type { RoomKind, Unit } from "@/data/inventory";
import LogoMark from "@/components/brand/LogoMark";
import PrintButton from "./PrintButton";

type Lang = "ka" | "en";

const TEXT = {
  en: {
    tagline: ["European residential", "complex"],
    project: "SEU Varketili",
    apartment: "Apartment N",
    block: "Block",
    floor: "Floor",
    total: "Total",
    floorPlan: "Floor Plan",
    plan: "Apartment plan",
    contact: "Interested? Contact us",
    office: "Sales office address",
    address: "Anna Politkovskaya 32, Tbilisi",
    print: "Download PDF / Print",
  },
  ka: {
    tagline: ["ევროპული საცხოვრებელი", "კომპლექსი"],
    project: "SEU ვარკეთილი",
    apartment: "ბინა N",
    block: "კორპუსი",
    floor: "სართული",
    total: "სულ",
    floorPlan: "სართულის გეგმა",
    plan: "ბინის გეგმა",
    contact: "დაინტერესდით? დაგვიკავშირდით",
    office: "გაყიდვების ოფისი",
    address: "ანა პოლიტკოვსკაიას 32, თბილისი",
    print: "PDF-ის ჩამოტვირთვა / ბეჭდვა",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

/*
 * Printable two-page A4 apartment presentation, laid out after the developer's PDF template
 * (docs/design/apartment-profile-template.pdf). "Download PDF" uses the browser's print-to-PDF.
 * Printed in the page's language: the website by its path (/ka/ is Georgian), the assistant by the visitor's choice.
 */
export default function ApartmentPresentation({ unit, lang = "en", rooms }: { unit: Unit; lang?: Lang; rooms: Record<RoomKind, string> }) {
  const t = TEXT[lang];
  return (
    <div className="presentation" lang={lang}>
      <div className="pres-toolbar">
        <PrintButton label={t.print} />
      </div>

      <section className="pres-page pres-cover" style={{ backgroundImage: `url(${withBase("/images/presentation-cover.jpg")})` }}>
        <div className="pres-card">
          <LogoMark className="w-40" />
          <p className="pres-serif mt-10 text-[54px] leading-none">SEU</p>
          <p className="pres-serif mt-4 text-[34px]">Development</p>
          <p className="mt-20 text-[13px] uppercase leading-relaxed tracking-[0.08em]">
            {t.tagline[0]}
            <br />
            {t.tagline[1]}
          </p>
          <p className="mt-8 text-[20px]">{t.project}</p>
        </div>
      </section>

      <section className="pres-page pres-sheet">
        <div className="grid grid-cols-[1.25fr_1fr] gap-8 px-12 pt-10">
          <img src={withBase("/images/apartment-plan.png")} alt={t.plan} className="w-full" />
          <div className="border-l border-seu-ink pl-6">
            <div className="flex justify-end">
              <LogoMark className="w-9" />
            </div>
            <p className="text-[12px]">{t.apartment}</p>
            <p className="pres-serif text-[24px] leading-tight">{unit.number}</p>
            <p className="mt-5 text-[12px]">{t.block}</p>
            <p className="pres-serif text-[18px] leading-tight">{unit.block.slice(1)}</p>
            <p className="mt-4 text-[12px]">{t.floor}</p>
            <p className="pres-serif text-[18px] leading-tight">{unit.floor}</p>
            <div className="mt-6 h-[2px] bg-[#2b3a45]" />
            <ul className="mt-4 space-y-3 text-[10px]">
              {unit.rooms.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{rooms[r.kind]}</span>
                  <span>{r.area} m²</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-seu-ink/20 pt-3 font-semibold">
                <span>{t.total}</span>
                <span>{unit.totalArea} m²</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 bg-[#1b2120] px-24 pb-12 pt-8 text-center text-white">
          <p className="pres-serif text-[22px]">{t.floorPlan}</p>
          <div className="relative mt-6 bg-white p-4">
            <div className="relative" style={{ aspectRatio: `${PLAN_RATIO}` }}>
              <img src={withBase(PLAN)} alt={t.floorPlan} className="h-full w-full" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <polygon points={UNIT_SHAPES[unit.slot].map((p) => p.join(",")).join(" ")} fill="#c2652a" fillOpacity={0.6} stroke="#fff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </svg>
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b2120] px-2.5 py-1 text-[11px] font-semibold text-white"
                style={{ left: `${centre(UNIT_SHAPES[unit.slot])[0]}%`, top: `${centre(UNIT_SHAPES[unit.slot])[1]}%` }}
              >
                {unit.number}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 px-12 pt-10 text-[12px]">
          <div>
            <p className="text-seu-ink/70">{t.contact}</p>
            <p className="pres-serif mt-4 text-[11px]">+995 596 70 70 70</p>
            <p className="pres-serif mt-3 text-[11px]">info@seudevelopment.ge</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.06em] text-seu-ink/70">{t.office}</p>
            <p className="pres-serif mt-4 text-[11px]">{t.address}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
