"use client";

import { withBase } from "@/data/projects";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { useLang } from "@/lib/useLang";

const paragraphs = [
  "SEU Development has been operating in the real estate market since 2014.",
  "The company's team, consisting of experienced professionals who care about continuous development, implements high construction standards and uses innovative and modern approaches that meet European standards.",
  "Successfully completed projects by SEU Development include the old and new buildings of the Georgian National University, which house modern educational and exhibition facilities, as well as a business center in the suburbs of Tbilisi. All SEU Development construction projects are fully funded at an early stage, which ensures they are completed on time.",
];
// The Georgian of seudevelopment.ge.
const paragraphsKa = [
  "SEU Development უძრავი ქონების ბაზარზე 2014 წლიდან ოპერირებს.",
  "კომპანიის გუნდი, რომელიც გამოცდილ პროფესიონალებს აერთიანებს, ზრუნავს მუდმივ განვითარებაზე, ახორციელებს მშენებლობის მაღალ სტანდარტებს და იყენებს ინოვაციურ და თანამედროვე მიდგომებს, რომლებიც საერთაშორისო სტანდარტებს აკმაყოფილებს.",
  "SEU Development-ის მიერ წარმატებით განხორციელებული პროექტები მოიცავს საქართველოს ეროვნული უნივერსიტეტი სეუ-ს ძველ და ახალ კორპუსებს, სადაც თანამედროვე საგანმანათლებლო და საგამოფენო სივრცეებია განთავსებული, ასევე ბიზნეს ცენტრს თბილისის გარეუბანში. SEU Development-ის ყველა სამშენებლო პროექტი ადრეულ ეტაპზეა სრულად დაფინანსებული, რაც მათ დროულ დასრულებას უზრუნველყოფს.",
];


export default function AboutSeu() {
  const ka = useLang() === "ka";

  return (
    <Section tone="light" className="overflow-hidden">
      <Container className="grid items-center gap-20 md:grid-cols-2">
        <div>
          <SectionHeader index="07" eyebrow={ka ? "დეველოპერი" : "Developer"} title={ka ? "SEU-ს შესახებ" : "About SEU"} spread={[{ text: ka ? "SEU-ს" : "About" }, { text: ka ? "შესახებ." : "SEU.", at: "end", accent: true }]} />
          <div className="mt-12 max-w-[52ch] space-y-5" data-stagger>
            {(ka ? paragraphsKa : paragraphs).map((p, i) => (
              <p key={i} className={i === 0 ? "lead" : "body-copy"}>
                {p}
              </p>
            ))}
            <div className="flex flex-wrap gap-3 pt-6">
              <ButtonLink href="/about/" variant="copper">
                {ka ? "ჩვენი ისტორია" : "Our story"}
              </ButtonLink>
              <ButtonLink href="#contact" variant="ghost">{ka ? "მოითხოვე ზარი" : "Request a call"}</ButtonLink>
            </div>
          </div>
        </div>
        {/* The colour mark, still; it only settles in once as the section arrives. */}
        <div className="relative mx-auto aspect-[500/460] w-[min(480px,80%)]" data-reveal>
          <img loading="lazy" decoding="async" src={withBase("/images/seu-s-color.png")} alt={ka ? "SEU-ს ლოგო" : "SEU logo"} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </Container>
    </Section>
  );
}
