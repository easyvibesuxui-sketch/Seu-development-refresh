import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, withBase } from "@/data/projects";
import { units, varketiliBlocks } from "@/data/inventory";
import BlockPicker from "@/components/project/BlockPicker";
import { AboutProject, ApartmentTypes, Benefits, ProjectStats, VirtualTour } from "@/components/project/ProjectDetails";
import BackLink from "@/components/ui/BackLink";
import ContactSection from "@/components/home/ContactSection";

const COPY: Record<string, { address: string; text: string; award?: string }> = {
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
};

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: projects.find((p) => p.id === id)?.name };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();
  const copy = COPY[id] ?? { address: `Tbilisi, ${project.district}`, text: `${project.name} is an upcoming SEU Development residential project in ${project.district}. Details will be published as the project is launched.` };
  const isVarketili = id === "varketili";
  const maxFloors = isVarketili ? Math.max(...varketiliBlocks.map((b) => b.floors)) : project.floors;

  return (
    <main>
      {isVarketili ? (
        <BlockPicker />
      ) : (
        <section className="relative h-[90svh] min-h-[560px] overflow-hidden">
          <div className="absolute inset-0" data-zoom>
            <img src={withBase(project.image)} alt={`${project.name} render`} style={{ objectPosition: project.imagePosition }} className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#15201d]/85 via-transparent to-[#15201d]" />
          <div className="relative z-10 px-6 pt-28 md:px-12">
            <BackLink href="/projects/" />
            <h1 className="title-display mt-10 text-[clamp(44px,6vw,92px)] uppercase leading-none" data-split>
              {project.name}
            </h1>
          </div>
        </section>
      )}
      <ProjectStats
        stats={[
          { label: "Location", value: project.district },
          { label: "Apartment sizes", value: `${project.sizes[0]}–${project.sizes[1]} m²` },
          { label: "Floors", value: maxFloors },
          isVarketili
            ? { label: "Available now", value: units.filter((u) => u.status === "available").length }
            : { label: "Status", value: project.status === "finished" ? `Finished ${project.date}` : `Starting ${project.date}` },
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
