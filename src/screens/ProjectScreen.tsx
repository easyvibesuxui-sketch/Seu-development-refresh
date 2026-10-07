import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { districtIn, nameIn, projects, statusIn, withBase } from "@/data/projects";
import { units, varketiliBlocks } from "@/data/inventory";
import { tr, type Lang } from "@/lib/i18n";
import BlockPicker from "@/components/project/BlockPicker";
import { AboutProject, ApartmentTypes, Benefits, ProjectStats, VirtualTour } from "@/components/project/ProjectDetails";
import BackLink from "@/components/ui/BackLink";
import ContactSection from "@/components/home/ContactSection";

type Copy = { address: string; text: string; award?: string };

const COPY: Record<Lang, Record<string, Copy>> = {
  en: {
    varketili: {
      address: "Tbilisi, Viktor Kupradze St. 22",
      text: "SEU Varketili is a new district of Varketili built to European standards with a completely different concept. The complex is planned with multifunctional infrastructure on 3.5 hectares: residential blocks, retail and office space, a school, sports grounds and up to two hectares of recreational space.",
      award:
        "Winner of the East Europe Real Estate Awards for the best future project of the year — the best example of urban development in Tbilisi, a new district created in a healthy environment.",
    },
    "green-yard": {
      address: "Tbilisi, Anna Politkovskaya St. 32",
      text: "Green Yard is a 19-storey residential complex in Saburtalo with a landscaped courtyard painted by artist Musia Keburia — a quiet, green setting a short walk from the metro.",
    },
    vasilisko: {
      address: "Tbilisi, Holy Martyr Vasilisko St. 1–3",
      text: "A completed residential complex in Saburtalo, among the projects that established SEU Development's reputation for finishing on time with fully funded construction.",
    },
  },
  ka: {
    varketili: {
      address: "თბილისი, ვიქტორ კუპრაძის ქ. 22",
      text: "SEU ვარკეთილი ვარკეთილის ახალი უბანია, ევროპული სტანდარტებითა და სრულიად განსხვავებული კონცეფციით. კომპლექსი 3.5 ჰექტარზე მრავალფუნქციური ინფრასტრუქტურით იგეგმება: საცხოვრებელი ბლოკები, სავაჭრო და საოფისე ფართები, სკოლა, სპორტული მოედნები და ორ ჰექტარამდე რეკრეაციული სივრცე.",
      award:
        "East Europe Real Estate Awards-ის გამარჯვებული წლის საუკეთესო მომავალი პროექტის ნომინაციაში — ურბანული განვითარების საუკეთესო მაგალითი თბილისში, ჯანსაღ გარემოში შექმნილი ახალი უბანი.",
    },
    "green-yard": {
      address: "თბილისი, ანა პოლიტკოვსკაიას ქ. 32",
      text: "Green Yard 19-სართულიანი საცხოვრებელი კომპლექსია საბურთალოზე, გამწვანებული ეზოთი, რომელიც მხატვარმა მუსია ქებურიამ მოხატა — მშვიდი, მწვანე გარემო მეტროდან რამდენიმე წუთის სავალზე.",
    },
    vasilisko: {
      address: "თბილისი, წმინდა მოწამე ვასილისკოს ქ. 1–3",
      text: "დასრულებული საცხოვრებელი კომპლექსი საბურთალოზე — ერთ-ერთი იმ პროექტთაგანი, რომლებმაც SEU Development-ს სრულად დაფინანსებული მშენებლობისა და დროული დასრულების რეპუტაცია შეუქმნა.",
    },
  },
};

export const projectParams = () => projects.map((p) => ({ id: p.id }));

export const projectMeta = (lang: Lang, id: string): Metadata => {
  const p = projects.find((x) => x.id === id);
  return { title: p ? nameIn(p, lang) : undefined };
};

export default function ProjectScreen({ lang, id }: { lang: Lang; id: string }) {
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();
  const t = tr(lang);
  const name = nameIn(project, lang);
  const district = districtIn(project.district, lang);
  const copy: Copy = COPY[lang][id] ?? {
    address: t(`Tbilisi, ${project.district}`, `თბილისი, ${district}`),
    text: t(
      `${project.name} is an upcoming SEU Development residential project in ${project.district}. Details will be published as the project is launched.`,
      `${name} SEU Development-ის მომავალი საცხოვრებელი პროექტია ${district.replace(/ი$/, "")}ში. დეტალები პროექტის გაშვებისას გამოქვეყნდება.`,
    ),
  };
  const isVarketili = id === "varketili";
  const maxFloors = isVarketili ? Math.max(...varketiliBlocks.map((b) => b.floors)) : project.floors;

  return (
    <main>
      {isVarketili ? (
        <BlockPicker />
      ) : (
        <section data-tone="dark" className="tone-dark relative h-[92svh] min-h-[600px] overflow-hidden">
          <div className="absolute inset-0" data-zoom>
            <img src={withBase(project.image)} alt={t(`${project.name} render`, `${name} — რენდერი`)} style={{ objectPosition: project.imagePosition }} className="h-full w-full object-cover" />
          </div>
          <div className="sunbeams sunbeams--soft" />
          <div className="absolute inset-0 bg-gradient-to-b from-seu-ink/80 via-transparent to-seu-bg" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1680px] flex-col justify-between px-gutter pb-16 pt-40">
            <div>
              <BackLink href="/projects/" label={t("All projects", "ყველა პროექტი")} />
            </div>
            <div>
              <p className="eyebrow mb-6">
                {statusIn(project.status, lang)} · {project.date}
              </p>
              <h1 className="page-title" data-split>
                {name}
                <span className="text-seu-accent-hi">.</span>
              </h1>
            </div>
          </div>
        </section>
      )}
      <ProjectStats
        stats={[
          { label: t("Location", "მდებარეობა"), value: district },
          { label: t("Apartment sizes", "ბინების ფართი"), value: `${project.sizes[0]}–${project.sizes[1]} ${t("m²", "მ²")}` },
          { label: t("Floors", "სართული"), value: maxFloors },
          isVarketili
            ? { label: t("Available now", "ახლა ხელმისაწვდომი"), value: units.filter((u) => u.status === "available").length }
            : {
                label: t("Status", "სტატუსი"),
                value: project.status === "finished" ? t(`Finished ${project.date}`, `დასრულდა ${project.date}`) : t(`Starting ${project.date}`, `იწყება ${project.date}`),
              },
        ]}
      />
      <AboutProject project={project} address={copy.address} text={copy.text} award={copy.award} />
      {isVarketili && (
        <>
          <Benefits />
          {project.videoId && <VirtualTour videoId={project.videoId} />}
          <ApartmentTypes projectId={id} />
        </>
      )}
      <ContactSection />
    </main>
  );
}
