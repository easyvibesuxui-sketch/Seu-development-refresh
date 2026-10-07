import type { Metadata } from "next";
import { tr, type Lang } from "@/lib/i18n";
import PageHero from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";

export const privacyMeta = (lang: Lang): Metadata => ({ title: tr(lang)("Privacy policy", "კონფიდენციალურობის პოლიტიკა") });

// English rendering of the policy published on seudevelopment.ge.
const SECTIONS_EN = [
  {
    title: null,
    body: [
      "This website, www.seudevelopment.ge (the \"Website\"), is the property of SEU Group Development Company LLC (ID 405062836). The trust of our customers and the privacy of their personal space are a priority for our company. This document explains how SEU Group Development Company LLC ensures the security and confidentiality of the information you provide, in accordance with applicable law.",
    ],
  },
  {
    title: "What information do we collect?",
    body: [
      "When you visit our website, data is collected in the following ways:",
      "Active communication: when you use the \"leave your number\" feature, we store your contact number in order to get in touch with you and send you offers that may interest you.",
      "Analytics: we record which source you came to the website from, how long you spent on a particular page and which products you were interested in. This helps us improve the quality of our service.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You have full control over your personal data and the right to:",
      "request information about how your data is processed;",
      "request the correction of incorrect or inaccurate data;",
      "request the deletion of your data or the termination of its processing.",
      "Note: the company will respond to any request within 30 working days.",
    ],
  },
  {
    title: "Data security and retention",
    body: [
      "The company uses modern technical and organisational measures to protect your information. Data is kept only for as long as necessary to improve the service and to achieve marketing purposes. Once the purpose is achieved, or at your request, the information is securely deleted.",
    ],
  },
];

// The Georgian original published on seudevelopment.ge (docs/audit/content/policy-ka.txt).
const SECTIONS_KA = [
  {
    title: null,
    body: [
      "წინამდებარე ვებ გვერდი www.seudevelopment.ge (შემდგომში „ვებ გვერდი“) წარმოადგენს შპს „სეუ გრუპ დეველოპმენტ კომპანი“-ს (ს/კ 405062836) საკუთრებას. ჩვენი კომპანიისთვის პრიორიტეტულია მომხმარებლის ნდობა და მათი პირადი სივრცის ხელშეუხებლობა. წინამდებარე დოკუმენტი განმარტავს, თუ როგორ უზრუნველყოფს შპს „სეუ გრუპ დეველოპმენტ კომპანი“ თქვენ მიერ მოწოდებული ინფორმაციის უსაფრთხოებასა და კონფიდენციალურობას მოქმედი კანონმდებლობის შესაბამისად.",
    ],
  },
  {
    title: "რა სახის ინფორმაციას ვაგროვებთ?",
    body: [
      "ჩვენს ვებგვერდზე სტუმრობისას მონაცემთა შეგროვება ხდება შემდეგი გზებით:",
      "აქტიური კომუნიკაცია: როდესაც იყენებთ „ნომრის დატოვების“ ფუნქციას, ჩვენ ვინახავთ თქვენს საკონტაქტო ნომერს თქვენთან დასაკავშირებლად და საინტერესო შეთავაზებების მოსაწოდებლად.",
      "ანალიტიკური მონაცემები: ჩვენ აღვრიცხავთ ინფორმაციას იმის შესახებ, თუ რომელი წყაროდან შემოხვედით ვებგვერდზე, რა დრო დაყავით კონკრეტულ გვერდზე და რა ტიპის პროდუქციით დაინტერესდით. ეს გვეხმარება მომსახურების ხარისხის გაუმჯობესებაში.",
    ],
  },
  {
    title: "მომხმარებლის უფლებები",
    body: [
      "თქვენ სრულად ფლობთ კონტროლს თქვენს პერსონალურ მონაცემებზე და გაქვთ უფლება:",
      "მოითხოვოთ ინფორმაცია თქვენი მონაცემების დამუშავების შესახებ;",
      "მოითხოვოთ არასწორი ან არაზუსტი მონაცემების შესწორება;",
      "მოითხოვოთ მონაცემების წაშლა ან მათი დამუშავების შეწყვეტა;",
      "შენიშვნა: ნებისმიერ მოთხოვნაზე კომპანია გიპასუხებთ 30 სამუშაო დღის განმავლობაში.",
    ],
  },
  {
    title: "მონაცემთა უსაფრთხოება და შენახვა",
    body: [
      "კომპანია იყენებს თანამედროვე ტექნიკურ და ორგანიზაციულ გადაწყვეტილებებს თქვენი ინფორმაციის დასაცავად. მონაცემები ინახება მხოლოდ იმ ვადით, რაც საჭიროა მომსახურების გაუმჯობესებისა და სარეკლამო მიზნების მისაღწევად. მიზნის მიღწევის ან თქვენი მოთხოვნის საფუძველზე, ინფორმაცია ექვემდებარება უსაფრთხო წაშლას.",
    ],
  },
];

export default function PrivacyScreen({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <main>
      <PageHero
        eyebrow={t("Last updated · 2026", "ბოლო განახლება · 2026")}
        title={t("Privacy policy", "კონფიდენციალურობის პოლიტიკა")}
        intro={t("How SEU Development collects, uses and protects the information you share with us.", "როგორ აგროვებს, იყენებს და იცავს SEU Development თქვენ მიერ გაზიარებულ ინფორმაციას.")}
      />
      <Section tone="light">
        <Container>
          <div className="mx-auto max-w-[68ch] space-y-16">
            {(lang === "ka" ? SECTIONS_KA : SECTIONS_EN).map((s, i) => (
              <div key={i} data-stagger>
                {s.title && <h2 className="title-m mb-6">{s.title}</h2>}
                {s.body.map((p) => (
                  <p key={p.slice(0, 24)} className="mb-4 text-[17px] leading-[1.8]">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
