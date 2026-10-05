"use client";

import { useId, useState } from "react";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";
import Sheet from "@/components/ui/Sheet";

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

export default function Hiring() {
  const [role, setRole] = useState<Role | null>(null);
  const [applying, setApplying] = useState(false);

  return (
    <Section id="career" tone="light">
      <Container className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <SectionHeader index="03" eyebrow="Benefits of working with us" title="We are hiring" className="lg:grid-cols-1" />
          <p className="body-copy mt-10 max-w-md">The company&apos;s team cares about continuous development and provides the best working environment.</p>
          <ul className="mt-10 space-y-3">
            {OFFER.map((o) => (
              <li key={o} className="flex items-center gap-3 text-[15px]">
                <Icon name="check" size={18} className="text-seu-accent-hi" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2" data-stagger aria-label="Open roles">
          {ROLES.map((r) => (
            <li key={r.id} className="flex flex-col rounded-[24px] bg-white p-7 shadow-[0_30px_80px_rgb(19_33_29/0.08)] md:p-8">
              <p className="eyebrow">Open role</p>
              <h3 className="title-m mt-4 text-[clamp(24px,2vw,30px)]">{r.title}</h3>
              <p className="mt-2 text-[15px] text-seu-muted">{r.lead}</p>
              <Meta role={r} className="mt-6" />
              <div className="mt-auto pt-8">
                <button type="button" aria-haspopup="dialog" onClick={() => setRole(r)} className="btn btn-primary w-full">
                  Details <Icon name="arrow" size={16} />
                  <span className="sr-only">: {r.title}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* Details rise as a sheet; Apply opens the form as a drawer above it. */}
      <Sheet open={!!role} onClose={() => setRole(null)} tone="light" eyebrow="Open role" title={role?.title} bodyClassName="px-gutter">
        {role && (
          <div className="mx-auto max-w-[1180px]">
            <Meta role={role} />
            <p className="lead mt-8 max-w-3xl">{role.about}</p>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              <List title="What you will do" items={role.tasks} />
              <List title="What we look for" items={role.needs} />
              <List title="What we offer" items={OFFER} />
            </div>
            <div className="sticky bottom-0 -mx-gutter mt-12 flex justify-end border-t border-seu-line bg-[var(--seu-paper)] px-gutter py-5">
              <button type="button" aria-haspopup="dialog" onClick={() => setApplying(true)} className="btn btn-primary btn-lg">
                Apply <Icon name="arrow" size={16} />
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
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-seu-muted ${className}`}>
      <li className="flex items-center gap-2">
        <Icon name="pin" size={16} className="text-seu-accent-hi" /> Tbilisi
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
  { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel" },
  { name: "link", label: "LinkedIn or portfolio", type: "url", required: false, autoComplete: "url" },
];

function ApplyDrawer({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const id = useId();
  const [file, setFile] = useState<string | null>(null);
  const [missingFile, setMissingFile] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    onClose();
    setSent(false);
  };

  return (
    <Sheet open={open} onClose={close} side="right" tone="light" eyebrow={`Apply · ${role.title}`} title="Your application" bodyClassName="px-8 pb-10 sm:px-10">
      {sent ? (
        <div role="status" className="pt-6">
          <p className="lead text-seu-accent-hi">Thank you! Your application has been sent.</p>
          <p className="body-copy mt-4">We read every application and will be in touch if your experience fits the role.</p>
          <button type="button" onClick={close} className="btn mt-10">
            Close
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
                {f.label}
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
                <span className="block truncate">{file ?? "Attach your CV"}</span>
                <span id={`${id}-cv-hint`} className={`block text-[13px] ${missingFile ? "text-seu-sold" : "text-seu-muted"}`} role={missingFile ? "alert" : undefined}>
                  {missingFile ? "Please attach your CV to apply." : "PDF or DOC, up to 5 MB"}
                </span>
              </span>
            </label>
          </div>
          <label className="block">
            <span className="field-label">A few words about you</span>
            <textarea name="note" className="field field-area" />
          </label>
          <label className="check-row text-[14px]">
            <input type="checkbox" required className="check" />
            I agree that SEU Development may keep my data for this application.
          </label>
          <button type="submit" className="btn btn-primary btn-lg w-full">
            Send application
          </button>
        </form>
      )}
    </Sheet>
  );
}
