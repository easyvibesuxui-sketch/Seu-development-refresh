"use client";

import { useId, useState } from "react";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";
import Sheet from "@/components/ui/Sheet";
import { useLang, useT } from "@/lib/useLang";

type Role = {
  id: string;
  title: string;
  team: string;
  type: string;
  lead: string;
  about: string;
  tasks: string[];
  needs: string[];
};

// Sample openings for this concept; SEU supplies the real ones.
const ROLES: Role[] = [
  {
    id: "marketing",
    title: "Marketing manager",
    team: "Marketing",
    type: "Full-time",
    lead: "Tell the story of homes made of light.",
    about:
      "You will plan and run campaigns for SEU Varketili and the projects to come, from the website and social channels to events and partner offers, and measure what brings buyers to the sales office.",
    tasks: [
      "Plan the yearly campaign calendar with sales",
      "Brief agencies, photographers and the web team",
      "Run paid search and social, and report on results",
      "Keep the brand consistent across every touchpoint",
    ],
    needs: ["3+ years in marketing, real estate or premium goods a plus", "Fluent Georgian and English", "Comfort with analytics and budgets"],
  },
  {
    id: "sales",
    title: "Sales consultant",
    team: "Sales",
    type: "Full-time",
    lead: "Help families find their home.",
    about:
      "You will guide buyers from the first visit to the keys: present the projects, walk them through the visual search and the show flat, and stay with them through contract and handover.",
    tasks: ["Meet visitors at the sales office and on site", "Prepare offers, reservations and contracts", "Follow up every lead in the CRM", "Keep in touch after handover"],
    needs: ["Experience in sales; real estate a plus", "Care for people and attention to detail", "Fluent Georgian; English or Russian a plus"],
  },
  {
    id: "engineer",
    title: "Site engineer",
    team: "Construction",
    type: "Full-time",
    lead: "Build to European standards.",
    about:
      "You will supervise structural and finishing works on site, keep the schedule and quality on track and work closely with designers and contractors on fully funded projects.",
    tasks: ["Supervise works and check them against the drawings", "Keep the site log, schedule and quality reports", "Coordinate contractors and suppliers", "Take part in handover inspections"],
    needs: ["Degree in civil engineering", "3+ years on residential sites", "AutoCAD; Revit a plus"],
  },
  {
    id: "architect",
    title: "Interior architect",
    team: "Design",
    type: "Full-time · hybrid",
    lead: "Shape the rooms people live in.",
    about:
      "You will design the layouts, finishes and common spaces of new blocks, prepare the show flats and the 3D layouts buyers see, and keep every detail buildable and within budget.",
    tasks: ["Develop flat layouts and finish packages", "Design lobbies, courtyards and amenity spaces", "Prepare visuals and specifications for sales", "Review samples and site details with engineers"],
    needs: ["Degree in architecture or interior design", "Portfolio of residential work", "3ds Max or similar; AutoCAD"],
  },
];

const OFFER = ["A stable, fully funded company", "Health insurance", "Training and growth plans", "A team that cares about the result"];

// The same openings in Georgian, for the Georgian pages.
const ROLES_KA: Role[] = [
  {
    id: "marketing",
    title: "მარკეტინგის მენეჯერი",
    team: "მარკეტინგი",
    type: "სრული განაკვეთი",
    lead: "მოჰყევით სინათლით სავსე სახლების ამბავს.",
    about:
      "დაგეგმავთ და განახორციელებთ კამპანიებს SEU ვარკეთილისა და მომავალი პროექტებისთვის — ვებსაიტიდან და სოციალური არხებიდან ღონისძიებებამდე და პარტნიორულ შეთავაზებებამდე — და გაზომავთ, რა მოჰყავს მყიდველები გაყიდვების ოფისში.",
    tasks: [
      "წლიური კამპანიების კალენდრის დაგეგმვა გაყიდვებთან ერთად",
      "სააგენტოების, ფოტოგრაფებისა და ვებ-გუნდის ბრიფინგი",
      "საძიებო და სოციალური რეკლამის მართვა და შედეგების ანგარიში",
      "ბრენდის ერთიანობის დაცვა ყველა არხში",
    ],
    needs: ["მარკეტინგში 3+ წლის გამოცდილება; უძრავი ქონება ან პრემიუმ პროდუქტი უპირატესობაა", "ქართულისა და ინგლისურის თავისუფალი ცოდნა", "ანალიტიკასა და ბიუჯეტებთან მუშაობის უნარი"],
  },
  {
    id: "sales",
    title: "გაყიდვების კონსულტანტი",
    team: "გაყიდვები",
    type: "სრული განაკვეთი",
    lead: "დაეხმარეთ ოჯახებს საკუთარი სახლის პოვნაში.",
    about:
      "მყიდველებს პირველი ვიზიტიდან გასაღებების გადაცემამდე გაუძღვებით: წარუდგენთ პროექტებს, გააცნობთ ვიზუალურ ძებნასა და სანიმუშო ბინას და ხელშეკრულებიდან ჩაბარებამდე მათ გვერდით იქნებით.",
    tasks: ["ვიზიტორების მიღება გაყიდვების ოფისსა და ობიექტზე", "შეთავაზებების, ჯავშნებისა და ხელშეკრულებების მომზადება", "ყველა კონტაქტის მართვა CRM-ში", "კავშირის შენარჩუნება ჩაბარების შემდეგაც"],
    needs: ["გამოცდილება გაყიდვებში; უძრავი ქონება უპირატესობაა", "ზრუნვა ადამიანებზე და ყურადღება დეტალებისადმი", "ქართულის თავისუფალი ცოდნა; ინგლისური ან რუსული უპირატესობაა"],
  },
  {
    id: "engineer",
    title: "სამშენებლო ობიექტის ინჟინერი",
    team: "მშენებლობა",
    type: "სრული განაკვეთი",
    lead: "ააშენეთ ევროპული სტანდარტებით.",
    about:
      "ობიექტზე ზედამხედველობას გაუწევთ კონსტრუქციულ და მოსაპირკეთებელ სამუშაოებს, დაიცავთ გრაფიკსა და ხარისხს და სრულად დაფინანსებულ პროექტებზე პროექტანტებთან და კონტრაქტორებთან მჭიდროდ ითანამშრომლებთ.",
    tasks: ["სამუშაოების ზედამხედველობა და ნახაზებთან შედარება", "საობიექტო ჟურნალის, გრაფიკისა და ხარისხის ანგარიშების წარმოება", "კონტრაქტორებისა და მომწოდებლების კოორდინაცია", "მონაწილეობა ჩაბარების ინსპექციებში"],
    needs: ["სამოქალაქო ინჟინერიის ხარისხი", "საცხოვრებელ ობიექტებზე 3+ წლის გამოცდილება", "AutoCAD; Revit უპირატესობაა"],
  },
  {
    id: "architect",
    title: "ინტერიერის არქიტექტორი",
    team: "დიზაინი",
    type: "სრული განაკვეთი · ჰიბრიდული",
    lead: "შექმენით ოთახები, სადაც ადამიანები ცხოვრობენ.",
    about:
      "დააპროექტებთ ახალი ბლოკების განლაგებებს, მოპირკეთებასა და საერთო სივრცეებს, მოამზადებთ სანიმუშო ბინებსა და მყიდველებისთვის 3D განლაგებებს და იზრუნებთ, რომ ყველა დეტალი შესრულებადი და ბიუჯეტის ფარგლებში იყოს.",
    tasks: ["ბინების განლაგებებისა და მოპირკეთების პაკეტების შემუშავება", "ლობების, ეზოებისა და საერთო სივრცეების დიზაინი", "ვიზუალებისა და სპეციფიკაციების მომზადება გაყიდვებისთვის", "ნიმუშებისა და საობიექტო დეტალების განხილვა ინჟინრებთან"],
    needs: ["არქიტექტურის ან ინტერიერის დიზაინის ხარისხი", "საცხოვრებელი პროექტების პორტფოლიო", "3ds Max ან მსგავსი; AutoCAD"],
  },
];
const OFFER_KA = ["სტაბილური, სრულად დაფინანსებული კომპანია", "ჯანმრთელობის დაზღვევა", "ტრენინგები და განვითარების გეგმები", "გუნდი, რომელიც შედეგზე ზრუნავს"];

export default function Hiring() {
  const [role, setRole] = useState<Role | null>(null);
  const [applying, setApplying] = useState(false);
  const ka = useLang() === "ka";
  const t = (en: string, kaText: string) => (ka ? kaText : en);
  const roles = ka ? ROLES_KA : ROLES;
  const offer = ka ? OFFER_KA : OFFER;

  return (
    <Section id="career" tone="light">
      <Container className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <SectionHeader index="03" eyebrow={t("Benefits of working with us", "ჩვენთან მუშაობის უპირატესობები")} title={t("We are hiring", "შემოუერთდი ჩვენს გუნდს")} className="lg:grid-cols-1" />
          <p className="body-copy mt-10 max-w-md">
            {t(
              "The company's team cares about continuous development and provides the best working environment.",
              "კომპანიის გუნდი ზრუნავს მუდმივ განვითარებაზე და უზრუნველყოფს საუკეთესო სამუშაო გარემოს.",
            )}
          </p>
          <ul className="mt-10 space-y-3">
            {offer.map((o) => (
              <li key={o} className="flex items-center gap-3 text-[15px]">
                <Icon name="check" size={18} className="text-seu-accent-hi" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2" data-stagger aria-label={t("Open roles", "ღია ვაკანსიები")}>
          {roles.map((r) => (
            <li key={r.id} className="flex flex-col rounded-[24px] bg-white p-7 shadow-[0_30px_80px_rgb(19_33_29/0.08)] md:p-8">
              <p className="eyebrow">{t("Open role", "ვაკანსია")}</p>
              <h3 className="title-m mt-4 text-[clamp(24px,2vw,30px)]">{r.title}</h3>
              <p className="mt-2 text-[15px] text-seu-muted">{r.lead}</p>
              <Meta role={r} className="mt-6" />
              <div className="mt-auto pt-8">
                <button type="button" aria-haspopup="dialog" onClick={() => setRole(r)} className="btn btn-primary w-full">
                  {t("Details", "დეტალები")} <Icon name="arrow" size={16} />
                  <span className="sr-only">: {r.title}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* Details rise as a sheet; Apply opens the form as a drawer above it. */}
      <Sheet open={!!role} onClose={() => setRole(null)} tone="light" eyebrow={t("Open role", "ვაკანსია")} title={role?.title} bodyClassName="px-gutter">
        {role && (
          <div className="mx-auto max-w-[1180px]">
            <Meta role={role} />
            <p className="lead mt-8 max-w-3xl">{role.about}</p>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              <List title={t("What you will do", "რას გააკეთებთ")} items={role.tasks} />
              <List title={t("What we look for", "ვის ვეძებთ")} items={role.needs} />
              <List title={t("What we offer", "რას გთავაზობთ")} items={offer} />
            </div>
            <div className="sticky bottom-0 -mx-gutter mt-12 flex justify-end border-t border-seu-line bg-[var(--seu-paper)] px-gutter py-5">
              <button type="button" aria-haspopup="dialog" onClick={() => setApplying(true)} className="btn btn-primary btn-lg">
                {t("Apply", "განაცხადის შევსება")} <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        )}
      </Sheet>
      {role && <ApplyDrawer role={role} open={applying} onClose={() => setApplying(false)} />}
    </Section>
  );
}

function Meta({ role, className = "" }: { role: Role; className?: string }) {
  const t = useT();
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-seu-muted ${className}`}>
      <li className="flex items-center gap-2">
        <Icon name="pin" size={16} className="text-seu-accent-hi" /> {t("Tbilisi", "თბილისი")}
      </li>
      <li className="flex items-center gap-2">
        <Icon name="briefcase" size={16} className="text-seu-accent-hi" /> {role.team}
      </li>
      <li className="flex items-center gap-2">
        <Icon name="clock" size={16} className="text-seu-accent-hi" /> {role.type}
      </li>
    </ul>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="field-label">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
            <Icon name="check" size={18} className="mt-0.5 shrink-0 text-seu-accent-hi" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

const FIELDS = [
  { name: "name", label: ["Full name", "სახელი და გვარი"], type: "text", required: true, autoComplete: "name" },
  { name: "email", label: ["Email", "ელ. ფოსტა"], type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: ["Phone", "ტელეფონი"], type: "tel", required: true, autoComplete: "tel" },
  { name: "link", label: ["LinkedIn or portfolio", "LinkedIn ან პორტფოლიო"], type: "url", required: false, autoComplete: "url" },
];

function ApplyDrawer({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const id = useId();
  const [file, setFile] = useState<string | null>(null);
  const [missingFile, setMissingFile] = useState(false);
  const [sent, setSent] = useState(false);
  const t = useT();

  const close = () => {
    onClose();
    setSent(false);
  };

  return (
    <Sheet open={open} onClose={close} side="right" tone="light" eyebrow={`${t("Apply", "განაცხადი")} · ${role.title}`} title={t("Your application", "თქვენი განაცხადი")} bodyClassName="px-8 pb-10 sm:px-10">
      {sent ? (
        <div role="status" className="pt-6">
          <p className="lead text-seu-accent-hi">{t("Thank you! Your application has been sent.", "მადლობა! თქვენი განაცხადი გაიგზავნა.")}</p>
          <p className="body-copy mt-4">
            {t(
              "We read every application and will be in touch if your experience fits the role.",
              "ყველა განაცხადს ვკითხულობთ და დაგიკავშირდებით, თუ თქვენი გამოცდილება პოზიციას შეესაბამება.",
            )}
          </p>
          <button type="button" onClick={close} className="btn mt-10">
            {t("Close", "დახურვა")}
          </button>
        </div>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) return setMissingFile(true);
            setSent(true);
          }}
        >
          {FIELDS.map((f) => (
            <label key={f.name} className="block">
              <span className="field-label">
                {t(f.label[0], f.label[1])}
                {f.required && <span className="text-seu-accent-hi"> *</span>}
              </span>
              <input name={f.name} type={f.type} required={f.required} autoComplete={f.autoComplete} className="field" />
            </label>
          ))}
          <div>
            <span id={`${id}-cv`} className="field-label">
              CV<span className="text-seu-accent-hi"> *</span>
            </span>
            <label className="dropzone" data-invalid={missingFile}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                aria-labelledby={`${id}-cv`}
                aria-describedby={`${id}-cv-hint`}
                aria-invalid={missingFile}
                onChange={(e) => {
                  setFile(e.target.files?.[0]?.name ?? null);
                  setMissingFile(false);
                }}
              />
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-seu-line text-seu-accent-hi">
                <Icon name={file ? "file" : "upload"} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate">{file ?? t("Attach your CV", "მიამაგრეთ CV")}</span>
                <span id={`${id}-cv-hint`} className={`block text-[13px] ${missingFile ? "text-seu-sold" : "text-seu-muted"}`} role={missingFile ? "alert" : undefined}>
                  {missingFile ? t("Please attach your CV to apply.", "განაცხადისთვის მიამაგრეთ CV.") : t("PDF or DOC, up to 5 MB", "PDF ან DOC, 5 მბ-მდე")}
                </span>
              </span>
            </label>
          </div>
          <label className="block">
            <span className="field-label">{t("A few words about you", "მოკლედ თქვენ შესახებ")}</span>
            <textarea name="note" className="field field-area" />
          </label>
          <label className="check-row text-[14px]">
            <input type="checkbox" required className="check" />
            {t("I agree that SEU Development may keep my data for this application.", "ვეთანხმები, რომ SEU Development ამ განაცხადისთვის ჩემს მონაცემებს შეინახავს.")}
          </label>
          <button type="submit" className="btn btn-primary btn-lg w-full">
            {t("Send application", "განაცხადის გაგზავნა")}
          </button>
        </form>
      )}
    </Sheet>
  );
}
