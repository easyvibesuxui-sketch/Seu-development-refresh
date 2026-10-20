import { withBase } from "@/data/projects";
import { PLAN, PLAN_RATIO, UNIT_SHAPES, centre } from "@/data/floorplan";
import type { RoomKind, Unit } from "@/data/inventory";
import LogoMark from "@/components/brand/LogoMark";
import PrintButton from "./PrintButton";
import ApartmentPlan from "./ApartmentPlan";

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
    bedrooms: "Bedrooms",
    studio: "Studio",
    rooms: "Room by room",
    m2: "m²",
    call: "Call",
    write: "Email",
  },
  ka: {
    tagline: ["ევროპული საცხოვრებელი", "კომპლექსი"],
    project: "SEU ვარკეთილი",
    apartment: "ბინა N",
    block: "ბლოკი",
    floor: "სართული",
    total: "სულ",
    floorPlan: "სართულის გეგმა",
    plan: "ბინის გეგმა",
    contact: "დაინტერესდით? დაგვიკავშირდით",
    office: "გაყიდვების ოფისი",
    address: "ანა პოლიტკოვსკაიას 32, თბილისი",
    print: "PDF-ის ჩამოტვირთვა / ბეჭდვა",
    bedrooms: "საძინებლები",
    studio: "სტუდიო",
    rooms: "ოთახები",
    m2: "მ²",
    call: "დარეკვა",
    write: "მიწერა",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

/*
 * Printable two-page A4 apartment presentation, laid out after the developer's PDF template
 * (docs/design/apartment-profile-template.pdf). "Download PDF" uses the browser's print-to-PDF.
 * Printed in the page's language: the website by its path (/en/ is English), the assistant by the visitor's choice.
 * Phones get the same content as a column of readable cards instead of shrunken A4 pages;
 * printing always uses the A4 pages.
 */
export default function ApartmentPresentation({ unit, lang = "en", rooms }: { unit: Unit; lang?: Lang; rooms: Record<RoomKind, string> }) {
  const t = TEXT[lang];
  return (
    <div className="presentation" lang={lang}>
      <div className="pres-toolbar">
        <PrintButton label={t.print} />
      </div>

      <MobilePresentation unit={unit} t={t} rooms={rooms} />

      <section className="pres-page pres-cover" style={{ backgroundImage: `url(${withBase("/images/presentation-cover.jpg")})` }}>
        <div className="pres-card">
          <LogoMark className="w-40" />
          <p className="pres-serif mt-10 text-[54px] leading-none">SEU</p>
          <p className="pres-serif mt-4 text-[34px]">Development</p>
          <p className="mt-20 text-[14px] uppercase leading-relaxed tracking-[0.08em]">
            {t.tagline[0]}
            <br />
            {t.tagline[1]}
          </p>
          <p className="mt-8 text-[20px]">{t.project}</p>
        </div>
      </section>

      <section className="pres-page pres-sheet">
        <div className="grid grid-cols-[1.25fr_1fr] gap-8 px-12 pt-10">
          <div className="aspect-[5/4]">
            <ApartmentPlan unit={unit} dims alt={t.plan} />
          </div>
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
                <li key={i} className="flex justify-between gap-3">
                  <span>{rooms[r.kind]}</span>
                  <span>{r.area} m²</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-seu-ink/20 pt-3 font-semibold">
                <span>{t.total}</span>
                <span>{unit.totalArea} m²</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 bg-[#1a1d22] px-24 pb-12 pt-8 text-center text-white">
          <p className="pres-serif text-[22px]">{t.floorPlan}</p>
          <FloorPlate unit={unit} alt={t.floorPlan} className="mt-6" />
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

/** The floor with this apartment marked on it. */
function FloorPlate({ unit, alt, className = "" }: { unit: Unit; alt: string; className?: string }) {
  const shape = UNIT_SHAPES[unit.slot];
  const [x, y] = centre(shape);
  return (
    <div className={`relative bg-white p-4 ${className}`}>
      <div className="relative" style={{ aspectRatio: `${PLAN_RATIO}` }}>
        <img src={withBase(PLAN)} alt={alt} className="h-full w-full" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polygon points={shape.map((p) => p.join(",")).join(" ")} fill="#c2652a" fillOpacity={0.6} stroke="#fff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1d22] px-2.5 py-1 text-[12px] font-semibold text-white" style={{ left: `${x}%`, top: `${y}%` }}>
          {unit.number}
        </span>
      </div>
    </div>
  );
}

/*
 * Phones: the presentation as cards sized for the screen (cover, plan and key figures, rooms,
 * floor, contacts), with the contacts as links. Hidden from 640px up and in print.
 */
function MobilePresentation({ unit, t, rooms }: { unit: Unit; t: (typeof TEXT)[Lang]; rooms: Record<RoomKind, string> }) {
  const facts: [string, string][] = [
    [t.block, unit.block.slice(1)],
    [t.floor, String(unit.floor)],
    [t.bedrooms, unit.bedrooms === 0 ? t.studio : String(unit.bedrooms)],
  ];
  const card = "w-full overflow-hidden rounded-[20px] bg-white text-[#131a22] shadow-[0_20px_60px_#0005]";
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-4 sm:hidden print:hidden">
      <section className="pres-cover w-full overflow-hidden rounded-[20px] py-10 text-[#131a22]" style={{ backgroundImage: `url(${withBase("/images/presentation-cover.jpg")})` }}>
        <div className="pres-card w-[84%] py-8">
          <LogoMark className="w-16" />
          <p className="pres-serif mt-5 text-[30px] leading-none">SEU</p>
          <p className="pres-serif mt-2 text-[20px]">Development</p>
          <p className="mt-6 text-[15px]">{t.project}</p>
          <p className="mt-1 text-[13px] text-[#131a22]/70">
            {t.apartment} <span className="font-semibold text-[#131a22]">{unit.number}</span>
          </p>
        </div>
      </section>

      <section className={card}>
        <div className="flex items-baseline justify-between gap-4 px-5 pt-5">
          <h2 className="pres-serif text-[20px]">{t.plan}</h2>
          <p className="text-[13px] text-[#131a22]/70">
            {t.apartment} <span className="pres-serif text-[18px] text-[#131a22]">{unit.number}</span>
          </p>
        </div>
        <div className="mt-3 aspect-[5/4] px-3">
          <ApartmentPlan unit={unit} dims alt={t.plan} />
        </div>
        <dl className="mt-2 grid grid-cols-3 border-t border-[#131a22]/10">
          {facts.map(([k, v], i) => (
            <div key={k} className={`px-4 py-4 ${i ? "border-l border-[#131a22]/10" : ""}`}>
              <dt className="text-[12px] text-[#131a22]/70">{k}</dt>
              <dd className="pres-serif mt-1 text-[22px] leading-none">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${card} px-5 py-5`}>
        <h2 className="pres-serif text-[20px]">{t.rooms}</h2>
        <ul className="mt-3 text-[15px]">
          {unit.rooms.map((r, i) => (
            <li key={i} className="flex justify-between gap-4 border-b border-[#131a22]/10 py-3">
              <span>{rooms[r.kind]}</span>
              <span className="tabular-nums">
                {r.area} {t.m2}
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-4 pt-3 font-semibold">
            <span>{t.total}</span>
            <span className="tabular-nums">
              {unit.totalArea} {t.m2}
            </span>
          </li>
        </ul>
      </section>

      <section className="w-full overflow-hidden rounded-[20px] bg-[#1a1d22] px-4 pb-4 pt-5 text-center text-white shadow-[0_20px_60px_#0005]">
        <h2 className="pres-serif text-[20px]">{t.floorPlan}</h2>
        <FloorPlate unit={unit} alt={t.floorPlan} className="mt-4 rounded-[12px] p-2" />
      </section>

      <section className={`${card} px-5 py-5 text-[15px]`}>
        <h2 className="text-[13px] text-[#131a22]/70">{t.contact}</h2>
        <a href="tel:+995596707070" className="pres-serif mt-3 flex min-h-11 items-center justify-between gap-4 border-b border-[#131a22]/10 text-[18px]">
          +995 596 70 70 70 <span className="font-sans text-[13px] font-semibold text-[#8e4416]">{t.call}</span>
        </a>
        <a href="mailto:info@seudevelopment.ge" className="flex min-h-11 items-center justify-between gap-4 border-b border-[#131a22]/10">
          info@seudevelopment.ge <span className="text-[13px] font-semibold text-[#8e4416]">{t.write}</span>
        </a>
        <p className="mt-4 text-[13px] text-[#131a22]/70">{t.office}</p>
        <p className="mt-1">{t.address}</p>
      </section>
    </div>
  );
}
