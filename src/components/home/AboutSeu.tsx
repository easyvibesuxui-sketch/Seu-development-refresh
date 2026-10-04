import Reveal from "@/components/ui/Reveal";
import { withBase } from "@/data/projects";

const paragraphs = [
  "SEU Development has been operating in the real estate market since 2014.",
  "The company's team, consisting of experienced professionals who care about continuous development, implements high construction standards and uses innovative and modern approaches that meet European standards.",
  "Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University, which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi. All SEU Development construction projects are fully funded at an early stage, which ensures they are completed on time.",
];

export default function AboutSeu() {
  return (
    <section className="bg-seu-cream px-6 py-32 text-[#1d1d1b]">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <div className="max-w-md">
          <Reveal as="h2" className="section-title">
            About SEU.
          </Reveal>
          <div className="mt-10 space-y-5 text-[15px] leading-relaxed">
            {paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 100}>
                {p}
              </Reveal>
            ))}
          </div>
          <Reveal delay={350}>
            <a
              href="#contact"
              className="mt-12 inline-block rounded bg-seu-green px-10 py-3 text-[14px] tracking-[0.08em] text-white transition hover:brightness-110"
            >
              CONTACT
            </a>
          </Reveal>
        </div>
        <Reveal variant="right" className="flex justify-center">
          <img src={withBase("/images/seu-s-color.png")} alt="SEU logo" className="w-[min(420px,80%)]" />
        </Reveal>
      </div>
    </section>
  );
}
