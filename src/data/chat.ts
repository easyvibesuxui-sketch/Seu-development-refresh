import { distanceKm, highlights, projects } from "./projects";
import { blockById, units, varketiliBlocks, type Unit, type ViewId } from "./inventory";
import { VIEW, type Lang, type Line } from "./assistant";

/*
 * Mariam's chat, ready for an AI later. Every answer — from these templates today, from a
 * model tomorrow — is one `ChatReply`: words, an optional action on the showroom (the same
 * actions as the buttons), apartment suggestions, the call form and follow-up chips. To plug
 * in an AI, implement `ChatEngine` with a request to a server that returns this shape (its tool
 * calls map onto `ChatAct`) and pass it to the assistant instead of `templateEngine`.
 *
 * The template engine reads the question's stems in Georgian and English; the first topic that
 * fits answers. Order matters: prices before apartments, names before places. Prices are never
 * named: those questions end with the call form.
 */

export type ChatAct =
  | { type: "scene"; to: "projects" | "varketili" | "buy" | "visit" | "green-yard" | "vasilisko" }
  | { type: "floor"; block: string; floor: number }
  | { type: "unit"; id: string };

export type ChatReply = {
  /** Mariam's words; left out when the action's own recorded line says it. */
  text?: Line;
  act?: ChatAct;
  /** Show the call request form under the answer. */
  form?: boolean;
  /** Apartment ids to show as cards in the chat. */
  units?: string[];
  /** Follow-up questions offered as chips. */
  suggest?: SuggestionId[];
  /** What a plain "yes" to this answer does. */
  offer?: ChatAct;
};

export type ChatContext = { lang: Lang; offer?: ChatAct };

export interface ChatEngine {
  reply(question: string, context: ChatContext): ChatReply | Promise<ChatReply>;
}

/* Follow-up chips: each sends its question as if it were typed. */
export const SUGGESTIONS = {
  projects: { ka: "რა პროექტები გაქვთ?", en: "What projects do you have?" },
  buy: { ka: "ბინის ყიდვა მინდა", en: "I want to buy an apartment" },
  visit: { ka: "ვიზიტის დაჯავშნა", en: "Book a visit" },
  call: { ka: "გადმომირეკეთ", en: "Call me back" },
  varketili: { ka: "მაჩვენე SEU ვარკეთილი", en: "Show me SEU Varketili" },
  greenYard: { ka: "Green Yard-ის ნახვა", en: "Show me Green Yard" },
  vasilisko: { ka: "ვასილისკოს ნახვა", en: "Show me Vasilisko" },
  upcoming: { ka: "რა პროექტები იწყება?", en: "What is coming next?" },
  sizes: { ka: "როგორი ბინები გაქვთ?", en: "What apartments do you have?" },
  studio: { ka: "სტუდიო მინდა", en: "I'd like a studio" },
  twoBed: { ka: "ორსაძინებლიანი ბინა", en: "A two-bedroom apartment" },
  threeBed: { ka: "სამსაძინებლიანი ბინა", en: "A three-bedroom apartment" },
  seaView: { ka: "ზღვის ხედით ბინა", en: "An apartment with a sea view" },
  highFloor: { ka: "მაღალ სართულზე", en: "On a high floor" },
  delivery: { ka: "როდის ჩაბარდება?", en: "When will it be ready?" },
  location: { ka: "სად მდებარეობს?", en: "Where is it?" },
  infrastructure: { ka: "რა არის ახლოს?", en: "What is nearby?" },
  amenities: { ka: "რა არის კომპლექსში?", en: "What is in the complex?" },
  parking: { ka: "პარკინგი არის?", en: "Is there parking?" },
  company: { ka: "კომპანიის შესახებ", en: "About the company" },
  reliability: { ka: "რამდენად სანდოა?", en: "How reliable is it?" },
  card: { ka: "რა არის SEU ბარათი?", en: "What is the SEU card?" },
  presentation: { ka: "PDF პრეზენტაცია", en: "PDF presentation" },
  contact: { ka: "საკონტაქტო ინფორმაცია", en: "Contact details" },
} satisfies Record<string, Line>;
export type SuggestionId = keyof typeof SUGGESTIONS;

/* ---------- facts the templates are built from (the same data as the website) ---------- */

const varketili = projects.find((p) => p.id === "varketili")!;
const greenYard = projects.find((p) => p.id === "green-yard")!;
const vasilisko = projects.find((p) => p.id === "vasilisko")!;
const upcoming = projects.filter((p) => p.status === "upcoming");
const open = units.filter((u) => u.status === "available");
const km = (id: string) => {
  const h = highlights.find((x) => x.id === id);
  return h && varketili.coords ? distanceKm(varketili.coords, h.coords).toFixed(1) : "";
};

const quarter = (d: string, ka: boolean) => {
  const m = d.match(/^Q(\d) (\d{4})$/);
  if (!m) return ka ? `${d} წელს` : `in ${d}`;
  return ka ? `${m[2]} წლის ${["", "პირველ", "მეორე", "მესამე", "მეოთხე"][+m[1]]} კვარტალში` : `in Q${m[1]} ${m[2]}`;
};
const deliveries = (ka: boolean) => {
  const done = varketiliBlocks.filter((b) => b.status === "delivered").map((b) => b.id.slice(1));
  const byDate = new Map<string, string[]>();
  varketiliBlocks.filter((b) => b.status !== "delivered").forEach((b) => byDate.set(b.delivery, [...(byDate.get(b.delivery) ?? []), b.id.slice(1)]));
  const list = (ids: string[]) => (ka ? ids.map((i) => `მე-${i}`).join(" და ") : ids.join(" and "));
  const soon = [...byDate].map(([d, ids]) => (ka ? `${list(ids)} — ${quarter(d, true)}` : `${ids.length > 1 ? "blocks" : "block"} ${list(ids)} ${quarter(d, false)}`));
  return ka
    ? `SEU ვარკეთილის ${list(done)} ბლოკი უკვე ჩაბარებულია. დანარჩენები ასე ჩაბარდება: ${soon.join("; ")}.`
    : `At SEU Varketili, block ${list(done)} is already delivered. The others follow: ${soon.join("; ")}.`;
};

const range = (list: Unit[]) => {
  const a = list.map((u) => u.totalArea);
  return [Math.round(Math.min(...a)), Math.round(Math.max(...a))];
};
const typesLine = (ka: boolean) =>
  [0, 1, 2, 3]
    .map((b) => {
      const list = units.filter((u) => u.bedrooms === b);
      if (!list.length) return "";
      const [lo, hi] = range(list);
      const free = list.filter((u) => u.status === "available").length;
      const name = ka ? ["სტუდიო", "ერთსაძინებლიანი", "ორსაძინებლიანი", "სამსაძინებლიანი"][b] : ["studios", "one-bedroom", "two-bedroom", "three-bedroom"][b];
      return ka ? `${name} ${lo}–${hi} მ² (${free} თავისუფალი)` : `${name} ${lo}–${hi} m² (${free} free)`;
    })
    .filter(Boolean)
    .join(ka ? "; " : "; ");

const viewsLine = (ka: boolean) =>
  (Object.keys(VIEW) as ViewId[])
    .map((v) => `${VIEW[v][ka ? "ka" : "en"]} — ${open.filter((u) => u.views.includes(v)).length}`)
    .join(", ");

/* ---------- reading the question ---------- */

/** Georgian letters mean a Georgian question, whatever language the page is in. */
export const questionLang = (q: string): Lang | null => (/[Ⴀ-ჿ]/.test(q) ? "ka" : /[a-z]/i.test(q) ? "en" : null);

const norm = (q: string) => ` ${q.toLowerCase().replace(/[?!.,;:«»„“"()]/g, " ").replace(/\s+/g, " ")} `;
/** Short Latin stems must stand as words ("hi" is not in "this"); the rest match inside words. */
const has = (q: string, stems: string[]) => stems.some((s) => (/^[a-z]{1,3}$/.test(s) ? new RegExp(`\\b${s}\\b`).test(q) : q.includes(s)));

/** "Block 7, floor 5" or "მე-7 ბლოკის მე-5 სართული": the floor a question names, if any. */
export function floorIn(question: string): { block: string; floor: number } | null {
  const q = question.toLowerCase();
  // The number can come before the noun ("მე-5 სართული", "5th floor") or after it ("სართული 5",
  // "floor 5"); a number right after the other noun belongs to that noun.
  const near = (word: string, other: string) =>
    q.match(new RegExp(`(?<!${other}\\S*\\s*)(?:მე-)?(\\d+)(?:-?ე|st|nd|rd|th)?\\s*${word}`))?.[1] ?? q.match(new RegExp(`${word}\\S*\\s*(?:მე-|#|№)?(\\d+)`))?.[1];
  const BLOCK = "(?:ბლოკ|კორპუს|block|building)";
  const FLOOR = "(?:სართულ|floor)";
  const b = near(BLOCK, FLOOR);
  const f = near(FLOOR, BLOCK);
  const block = b && varketiliBlocks.find((x) => x.id === `v${b}`);
  if (!block || !f || +f < 2 || +f > block.floors) return null;
  return { block: block.id, floor: +f };
}

/** "ბინა 801", "apartment 702", "№ 503": the apartments a question names, by number (and block). */
function unitsNamed(q: string): Unit[] {
  const n = q.match(/(?:ბინა|ბინის|ბინას|apartment|apt|flat|unit|№|#)\s*(?:n|№|#)?\s*(\d{3,4})/)?.[1] ?? q.match(/\b(\d{3,4})\s*(?:ბინა|ნომერ)/)?.[1];
  if (!n) return [];
  const block = q.match(/(?:ბლოკ\S*|კორპუს\S*|block)\s*(\d)/)?.[1] ?? q.match(/(\d)\s*(?:-?ე\s*)?(?:ბლოკ|კორპუს|block)/)?.[1];
  return units.filter((u) => String(u.number) === n && (!block || u.block === `v${block}`));
}

type Wish = { bedrooms?: number; view?: ViewId; size?: [number, number]; high?: boolean; low?: boolean; block?: string };

/** What kind of apartment a question asks for, if it says. */
function wishIn(q: string): Wish | null {
  const w: Wish = {};
  if (has(q, ["სტუდიო", "studio"])) w.bedrooms = 0;
  const words: [string[], number][] = [
    [["ერთსაძინებ", "1-საძინებ", "ერთოთახ", "ოროთახ", "one bed", "one-bed", "1 bed", "1-bed"], 1],
    [["ორსაძინებ", "2-საძინებ", "სამოთახ", "two bed", "two-bed", "2 bed", "2-bed"], 2],
    [["სამსაძინებ", "3-საძინებ", "ოთხოთახ", "three bed", "three-bed", "3 bed", "3-bed", "family"], 3],
  ];
  for (const [stems, n] of words) if (has(q, stems)) w.bedrooms = n;
  const num = q.match(/(\d)\s*-?\s*(საძინებ|bed)/);
  if (num) w.bedrooms = Math.min(3, +num[1]);
  const rooms = q.match(/(\d)\s*-?\s*ოთახ/);
  if (rooms) w.bedrooms = Math.max(0, Math.min(3, +rooms[1] - 1));
  const views: [string[], ViewId][] = [
    [["ზღვ", "sea"], "sea"],
    [["პარკ", "park"], "park"],
    [["ქალაქ", "city"], "city"],
    [["მთ", "mountain", "hills"], "mountains"],
    [["ეზოს ხედ", "ეზოზე", "courtyard"], "courtyard"],
    [["პანორამ", "panoram"], "panorama"],
  ];
  if (has(q, ["ხედ", "view", "look", "ფანჯ", "window", "facing", "გადაჰყურ"]) || has(q, ["ზღვის", "sea view"]))
    for (const [stems, v] of views) if (has(q, stems)) w.view = v;
  const m2 = q.match(/(\d{2,3})\s*(?:-?\s*)?(?:მ²|მ2|კვ|მეტრ|m2|m²|sqm|square|sq)/);
  if (m2) w.size = [+m2[1] - 8, +m2[1] + 8];
  if (has(q, ["დიდი", "დიდ ბინ", "ფართო", "large", "big", "spacious"])) w.size = [85, 999];
  if (has(q, ["პატარა", "small", "compact"])) w.size = [0, 55];
  if (has(q, ["მაღალ სართ", "მაღლა", "ზედა სართ", "high floor", "top floor", "upper floor", "higher"])) w.high = true;
  if (has(q, ["დაბალ სართ", "ქვედა სართ", "low floor", "lower floor", "ground"])) w.low = true;
  const block = q.match(/(?:ბლოკ\S*|კორპუს\S*|block)\s*(\d)/)?.[1] ?? q.match(/(\d)\s*(?:-?ე\s*)?(?:ბლოკ|კორპუს|block)/)?.[1];
  if (block && blockById(`v${block}`)) w.block = `v${block}`;
  return Object.keys(w).length ? w : null;
}

function matches(w: Wish): Unit[] {
  const mid = w.size ? (w.size[0] + Math.min(w.size[1], 140)) / 2 : 0;
  return open
    .filter(
      (u) =>
        (w.bedrooms === undefined || u.bedrooms === w.bedrooms) &&
        (!w.view || u.views.includes(w.view)) &&
        (!w.size || (u.totalArea >= w.size[0] && u.totalArea <= w.size[1])) &&
        (!w.high || u.floor >= 9) &&
        (!w.low || u.floor <= 4) &&
        (!w.block || u.block === w.block),
    )
    .sort((a, b) => (w.size ? Math.abs(a.totalArea - mid) - Math.abs(b.totalArea - mid) : 0) || (w.low ? a.floor - b.floor : b.floor - a.floor));
}

const VIEW_PHRASE: Record<ViewId, Line> = {
  sea: { ka: "ხედით თბილისის ზღვაზე", en: "with a view of the Tbilisi Sea" },
  park: { ka: "ხედით ჰუალინგის პარკზე", en: "overlooking Hualing Park" },
  city: { ka: "ხედით ქალაქზე", en: "with a city view" },
  mountains: { ka: "ხედით მთებზე", en: "with a view of the mountains" },
  courtyard: { ka: "ხედით ეზოზე", en: "overlooking the courtyard" },
  panorama: { ka: "პანორამული ხედით", en: "with a panoramic view" },
};

function wishText(w: Wish, count: number): Line {
  const kind = {
    ka: w.bedrooms === undefined ? "ბინა" : w.bedrooms === 0 ? "სტუდიო" : `${["", "ერთსაძინებლიანი", "ორსაძინებლიანი", "სამსაძინებლიანი"][w.bedrooms]} ბინა`,
    en: w.bedrooms === undefined ? "apartments" : w.bedrooms === 0 ? "studios" : `${["", "one-bedroom", "two-bedroom", "three-bedroom"][w.bedrooms]} apartments`,
  };
  const extra = (l: Lang) =>
    [
      w.view && VIEW_PHRASE[w.view][l],
      w.high && (l === "ka" ? "მაღალ სართულზე" : "on a high floor"),
      w.low && (l === "ka" ? "დაბალ სართულზე" : "on a low floor"),
      w.block && (l === "ka" ? `მე-${w.block.slice(1)} ბლოკში` : `in block ${w.block.slice(1)}`),
    ]
      .filter(Boolean)
      .join(l === "ka" ? ", " : ", ");
  const ka = extra("ka");
  const en = extra("en");
  return {
    ka: `SEU ვარკეთილში მოიძებნა ${count} თავისუფალი ${kind.ka}${ka ? `, ${ka}` : ""}. აი, საუკეთესო ვარიანტები — დააჭირეთ და დეტალებს გაჩვენებთ.`,
    en: `I found ${count} available ${kind.en}${en ? ` ${en}` : ""} at SEU Varketili. Here are the best matches — click one for the details.`,
  };
}

/* ---------- the topics ---------- */

type Topic = { id: string; stems: string[]; reply: ChatReply | ((q: string, c: ChatContext) => ChatReply) };

const CALL: ChatReply = { form: true, suggest: ["visit", "contact"] };

const TOPICS: Topic[] = [
  {
    id: "price",
    stems: ["ფას", "ღირ", "გადახდ", "განვადებ", "იპოთეკ", "სესხ", "ფასდაკ", "ბიუჯეტ", "price", "cost", "how much", "pay", "installment", "mortgage", "loan", "discount", "budget", "$", "₾", "usd", "gel", "dollar", "ლარ", "დოლარ"],
    reply: {
      ...CALL,
      text: {
        ka: "პირობებს ჩატში არ ვასახელებთ: ყოველ ბინაზე ჩვენი კონსულტანტი ინდივიდუალურად გესაუბრებათ, განვადებისა და იპოთეკის ჩათვლით. დატოვეთ ნომერი და გადმოგირეკავთ.",
        en: "We don't discuss terms in the chat: a consultant will talk you through each apartment personally, including instalments and mortgages. Leave your number and we will call you back.",
      },
    },
  },
  {
    id: "contact",
    stems: ["ტელეფ", "ნომერ", "დარეკ", "დაგირეკ", "გადმომირეკ", "მეილ", "ფოსტ", "კონტაქტ", "phone", "number", "call", "email", "e-mail", "contact"],
    reply: {
      ...CALL,
      suggest: ["visit", "location"],
      text: {
        ka: "დაგვირეკეთ +995 596 70 70 70 ნომერზე ან მოგვწერეთ info@seudevelopment.ge-ზე. ოფისი ანა პოლიტკოვსკაიას 32-შია. შეგიძლიათ ნომერიც დატოვოთ და გადმოგირეკავთ.",
        en: "Call us on +995 596 70 70 70 or write to info@seudevelopment.ge. The office is at 32 Anna Politkovskaya Street. You can also leave your number and we will call you back.",
      },
    },
  },
  {
    id: "who",
    stems: ["ვინ ხარ", "რა გქვია", "შენ ვინ", "ვინ ბრძანდებით", "who are you", "your name", "are you a bot", "are you real", "ბოტი ხარ", "რობოტ"],
    reply: {
      suggest: ["projects", "buy", "visit"],
      text: {
        ka: "მე მარიამი ვარ, SEU Development-ის ვირტუალური კონსულტანტი. გაჩვენებთ პროექტებს, შეგირჩევთ ბინას და ვიზიტს დაგიჯავშნით; ზუსტ პირობებს კი ჩვენი გაყიდვების გუნდი გაგაცნობთ.",
        en: "I'm Mariam, SEU Development's virtual consultant. I can show you our projects, find you an apartment and book a visit; our sales team will give you the exact terms.",
      },
    },
  },
  {
    id: "upcoming",
    stems: ["მომავალ", "ახალი პროექტ", "იწყება", "დაიწყება", "ვარკეთილი 2", "ვარკეთილი ii", "upcoming", "next project", "new project", "coming next", "what's next", "future", "varketili 2", "varketili ii"],
    reply: {
      suggest: ["varketili", "delivery", "call"],
      text: {
        ka: `შემდეგი პროექტებია ${upcoming.map((p) => `SEU ვარკეთილი ${p.name.split(" ").pop()} (${p.floors} სართული, ${p.sizes[0]}–${p.sizes[1]} მ², იწყება ${p.date})`).join(" და ")}. დეტალები გაშვებისას გამოქვეყნდება; თუ გინდათ, პირველებს დაგიკავშირდებით.`,
        en: `Next come ${upcoming.map((p) => `${p.name} (${p.floors} floors, ${p.sizes[0]}–${p.sizes[1]} m², starting ${p.date})`).join(" and ")}. Details will be published at launch; if you like, we will call you first.`,
      },
      form: true,
    },
  },
  {
    id: "green-yard",
    stems: ["green", "გრინ", "იარდ", "მწვანე ეზო", "ჯიქია", "jikia", "პოლიტკოვსკ", "politkovsk"],
    reply: {
      act: { type: "scene", to: "green-yard" },
      suggest: ["vasilisko", "varketili", "company"],
      text: {
        ka: `SEU Green Yard ${greenYard.floors}-სართულიანი საცხოვრებელი კომპლექსია საბურთალოზე, ანა პოლიტკოვსკაიას 32-ში, მუსია ქებურიას მოხატული ეზოთი. დასრულდა ${greenYard.date} წელს და დასახლებულია.`,
        en: `SEU Green Yard is a ${greenYard.floors}-storey residential complex in Saburtalo at 32 Anna Politkovskaya Street, with a courtyard painted by Musia Keburia. It was finished in ${greenYard.date} and is lived in.`,
      },
    },
  },
  {
    id: "vasilisko",
    stems: ["ვასილ", "vasil"],
    reply: {
      act: { type: "scene", to: "vasilisko" },
      suggest: ["greenYard", "varketili", "company"],
      text: {
        ka: `SEU ვასილისკო ${vasilisko.floors}-სართულიანი საცხოვრებელი კომპლექსია საბურთალოზე, წმინდა მოწამე ვასილისკოს ქუჩაზე. დასრულდა ${vasilisko.date} წელს — სრულად დაფინანსებული და დროულად ჩაბარებული.`,
        en: `SEU Vasilisko is a ${vasilisko.floors}-storey residential complex in Saburtalo, on Holy Martyr Vasilisko Street. It was finished in ${vasilisko.date} — fully funded and delivered on time.`,
      },
    },
  },
  {
    id: "location",
    stems: ["სად ", "მდებარ", "მისამართ", "ლოკაცი", "ზღვასთან", "ზღვა სად", "where", "locat", "address", "district", "area is"],
    reply: {
      suggest: ["infrastructure", "visit", "varketili"],
      text: {
        ka: "SEU ვარკეთილი ვიქტორ კუპრაძის ქუჩა 22-შია, თბილისის ზღვასთან და ჰუალინგის პარკთან ახლოს. გაყიდვების ოფისი ანა პოლიტკოვსკაიას 32-შია, საბურთალოზე.",
        en: "SEU Varketili is at 22 Viktor Kupradze Street, close to the Tbilisi Sea and Hualing Park. The sales office is at 32 Anna Politkovskaya Street in Saburtalo.",
      },
    },
  },
  { id: "visit", stems: ["ვიზიტ", "შეხვედრ", "ოფის", "მოსვლ", "მოვალ", "სანიმუშო", "visit", "meet", "office", "appointment", "show flat", "come by"], reply: { act: { type: "scene", to: "visit" }, suggest: ["location", "contact"] } },
  {
    id: "delivery",
    stems: ["ჩაბარ", "როდის", "დასრულ", "მშენებლობ", "შესახლ", "ვადა", "ვადებ", "when", "deliver", "ready", "finish", "complet", "construction", "move in", "deadline", "handover"],
    reply: { suggest: ["sizes", "reliability", "buy"], text: { ka: deliveries(true), en: deliveries(false) } },
  },
  {
    id: "reliability",
    stems: ["სანდო", "გარანტ", "დაფინანს", "რისკ", "ენდობ", "reliab", "trust", "guarantee", "fund", "risk", "safe invest"],
    reply: {
      suggest: ["delivery", "company", "visit"],
      text: {
        ka: "SEU Development-ის ყველა პროექტი მშენებლობის დაწყებიდანვე სრულადაა დაფინანსებული — ამიტომ სამუშაოები არ ჩერდება და ვადებს ვიცავთ. Green Yard და ვასილისკო უკვე დასახლებულია, ვარკეთილის მე-3 ბლოკი კი ჩაბარებულია.",
        en: "Every SEU Development project is fully funded from the start of construction — so work never stops and we keep to our dates. Green Yard and Vasilisko are lived in, and block 3 at Varketili is delivered.",
      },
    },
  },
  {
    id: "company",
    stems: ["კომპანი", "დეველოპერ", "ისტორი", "გამოცდილ", "ჯილდო", "about you", "about the company", "company", "developer", "history", "experience", "award", "since"],
    reply: {
      suggest: ["reliability", "projects", "card"],
      text: {
        ka: "SEU Development უძრავი ქონების ბაზარზე 2014 წლიდან ოპერირებს. ჩვენ ავაშენეთ საქართველოს ეროვნული უნივერსიტეტის — სეუ-ს — ძველი და ახალი კორპუსები, Green Yard და ვასილისკო, ახლა კი ვარკეთილის ახალ უბანს ვაშენებთ. ვარკეთილის პროექტმა East Europe Real Estate Awards მოიგო.",
        en: "SEU Development has been in real estate since 2014. We built the old and new buildings of SEU, the Georgian National University, Green Yard and Vasilisko, and are now building a new district in Varketili, which won the East Europe Real Estate Awards.",
      },
    },
  },
  {
    id: "amenities",
    stems: ["ინფრასტრ", "კომპლექსში", "რა არის ეზო", "ეზო", "დაცვ", "უსაფრთ", "ლობი", "სპორტ", "ჩოგბურთ", "სავარჯიშ", "საბავშვო", "amenit", "facilit", "in the complex", "courtyard", "security", "secure", "lobby", "gym", "tennis", "playground", "sport"],
    reply: {
      suggest: ["parking", "infrastructure", "buy"],
      text: {
        ka: "SEU ვარკეთილში: 2 ჰექტარამდე რეკრეაციული სივრცე, დაცული ეზო, ლობი ყოველი ბლოკის შესასვლელში, საბავშვო და სპორტული მოედნები, ჩოგბურთის კორტები, სავარჯიშო დარბაზი, სკოლა და სავაჭრო-საოფისე ფართები.",
        en: "At SEU Varketili: up to 2 hectares of recreation, a secure courtyard, a lobby at every block's entrance, playgrounds and sports grounds, tennis courts, a gym, a school, and shops and offices on site.",
      },
    },
  },
  {
    id: "parking",
    stems: ["პარკინგ", "ავტოსადგომ", "მანქან", "გარაჟ", "parking", "garage", "car"],
    reply: {
      suggest: ["amenities", "call"],
      text: {
        ka: "დიახ, კომპლექსს მიწისქვეშა და ზედაპირული პარკინგი აქვს. ადგილის პირობებს კონსულტანტი გაგაცნობთ.",
        en: "Yes, the complex has underground and surface parking. A consultant will go through the terms for a space with you.",
      },
    },
  },
  {
    id: "infrastructure",
    stems: ["რა არის ახლოს", "ახლოს", "სკოლ", "ბაღ", "მაღაზი", "სავაჭრო", "მეტრო", "ტრანსპორტ", "nearby", "near by", "school", "kindergarten", "shop", "mall", "metro", "transport", "bus"],
    reply: {
      suggest: ["location", "amenities", "buy"],
      text: {
        ka: `SEU ვარკეთილიდან: ჰუალინგის პარკი ${km("hualing-park")} კმ-ში, Hualing Tbilisi Sea Plaza ${km("hualing-plaza")} კმ-ში, East Point ${km("east-point")} კმ-ში, მეტრო ვარკეთილი ${km("varketili-metro")} კმ-ში. სკოლა, მაღაზიები და ოფისები კომპლექსშივეა.`,
        en: `From SEU Varketili: Hualing Park ${km("hualing-park")} km, Hualing Tbilisi Sea Plaza ${km("hualing-plaza")} km, East Point ${km("east-point")} km, Varketili metro ${km("varketili-metro")} km. A school, shops and offices are inside the complex.`,
      },
    },
  },
  {
    id: "card",
    stems: ["ბარათ", "card"],
    reply: {
      suggest: ["company", "buy"],
      text: {
        ka: "ჩვენი პროექტების მაცხოვრებლები პერსონალურ SEU ბარათს იღებენ: მასით პარტნიორ დაწესებულებებში განსაკუთრებული პირობები მოქმედებს.",
        en: "Residents of our projects receive a personal SEU card, which brings exclusive conditions at our partner establishments.",
      },
    },
  },
  {
    id: "finish",
    stems: ["რემონტ", "მოპირკეთ", "კარკას", "მწვანე კარკ", "თეთრი კარკ", "ჭერ", "მასალ", "იზოლაც", "renovat", "finish", "white frame", "shell", "ceiling", "material", "insulat", "energy"],
    reply: {
      ...CALL,
      text: {
        ka: "ვაშენებთ მხოლოდ ენერგოეფექტური და ეკოლოგიურად სუფთა მასალებით. ჩაბარების მდგომარეობასა და ტექნიკურ დეტალებს კონსულტანტი ზუსტად გაგაცნობთ — დატოვეთ ნომერი.",
        en: "We build only with energy-efficient, environmentally clean materials. A consultant will give you the exact handover condition and technical details — leave your number.",
      },
    },
  },
  {
    id: "presentation",
    stems: ["პრეზენტაც", "pdf", "ბროშურ", "კატალოგ", "brochure", "catalog", "presentation", "download"],
    reply: {
      suggest: ["twoBed", "seaView", "buy"],
      text: {
        ka: "ყველა ბინას თავისი PDF პრეზენტაცია აქვს — გეგმით, ფართებითა და ხედებით. აირჩიეთ ბინა და ბარათზე „PDF პრეზენტაციას“ დააჭირეთ, ან მითხარით, როგორი ბინა გინდათ.",
        en: "Every apartment has its own PDF presentation — plan, sizes and views. Pick an apartment and press “PDF presentation” on its card, or tell me what you are looking for.",
      },
    },
  },
  {
    id: "views",
    stems: ["რა ხედ", "ხედები", "which views", "what views", "the views"],
    reply: {
      suggest: ["seaView", "highFloor", "buy"],
      text: {
        ka: `თავისუფალი ბინები ხედების მიხედვით: ${viewsLine(true)}. რომელი გირჩევნიათ?`,
        en: `Available apartments by view: ${viewsLine(false)}. Which would you prefer?`,
      },
    },
  },
  {
    id: "sizes",
    stems: ["როგორი ბინ", "რა ბინ", "რა ზომ", "ფართ", "ზომ", "კვადრ", "ოთახ", "what apartments", "which apartments", "sizes", "size", "types", "layouts", "how big", "rooms"],
    reply: {
      suggest: ["studio", "twoBed", "threeBed", "seaView"],
      text: {
        ka: `SEU ვარკეთილში გვაქვს: ${typesLine(true)}. მითხარით, როგორი გინდათ, და შეგირჩევთ.`,
        en: `At SEU Varketili we have ${typesLine(false)}. Tell me what you'd like and I'll pick some for you.`,
      },
    },
  },
  { id: "floor", stems: ["ვარკეთ", "varketil", "სართულ", "გეგმ", "ბლოკ", "კორპუს", "maquette", "floor", "plan", "block"], reply: { act: { type: "scene", to: "varketili" }, suggest: ["sizes", "delivery", "seaView"] } },
  { id: "buy", stems: ["ყიდ", "შეძენ", "ბინ", "buy", "purchase", "apartment", "flat", "home"], reply: { act: { type: "scene", to: "buy" }, suggest: ["sizes", "twoBed", "seaView"] } },
  { id: "projects", stems: ["პროექტ", "მაკეტ", "შოურუმ", "project", "model", "showroom", "show me"], reply: { act: { type: "scene", to: "projects" }, suggest: ["varketili", "greenYard", "vasilisko"] } },
  {
    id: "hello",
    stems: ["გამარჯ", "სალამ", "დილა მშვიდ", "საღამო მშვიდ", "hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    reply: {
      suggest: ["projects", "buy", "visit"],
      offer: { type: "scene", to: "projects" },
      text: {
        ka: "გამარჯობა! შემიძლია პროექტები გაჩვენოთ, ბინა შეგირჩიოთ ან ვიზიტი დაგიჯავშნოთ. დავიწყოთ პროექტებით?",
        en: "Hello! I can show you our projects, help you choose an apartment or book you a visit. Shall we start with the projects?",
      },
    },
  },
  {
    id: "thanks",
    stems: ["მადლობ", "გმადლობ", "thank", "thx"],
    reply: { suggest: ["visit", "call"], text: { ka: "არაფრის! კიდევ თუ რამე გაინტერესებთ, მკითხეთ.", en: "You're welcome! Ask me if there is anything else." } },
  },
  {
    id: "bye",
    stems: ["ნახვამდის", "კარგად", "bye", "goodbye", "see you"],
    reply: { suggest: ["visit"], text: { ka: "ნახვამდის! მოხარული ვიქნები, თუ ოფისში გვესტუმრებით.", en: "Goodbye! I'd be glad to see you at our office." } },
  },
];

const YES = ["კი", "დიახ", "ჰო", "კარგი", "გაჩვენე", "მაჩვენე", "yes", "yeah", "yep", "sure", "ok", "okay", "please"];
const NO = ["არა", "no", "nope"];

const NO_ANSWER: ChatReply = {
  ...CALL,
  suggest: ["projects", "buy", "visit"],
  text: {
    ka: "ამაზე ზუსტ პასუხს ჩვენი კონსულტანტი გაგცემთ. დატოვეთ ნომერი და გადმოგირეკავთ, ან აირჩიეთ ქვემოთ.",
    en: "A consultant will give you the exact answer to that. Leave your number and we will call you back, or choose below.",
  },
};

/** Today's engine: the templates above, answered in the page itself. */
export const templateEngine: ChatEngine = {
  reply(question, context) {
    const q = norm(question);
    // A short "yes" or "no" answers Mariam's last offer.
    const words = q.trim().split(" ");
    if (words.length <= 3) {
      if (context.offer && YES.includes(words[0])) return { act: context.offer };
      if (NO.includes(words[0])) return { suggest: ["projects", "buy", "visit"], text: { ka: "კარგი. სხვა რამით შემიძლია დაგეხმაროთ?", en: "All right. Is there anything else I can help with?" } };
    }
    const price = TOPICS[0];
    if (has(q, price.stems)) return price.reply as ChatReply;

    const named = unitsNamed(q);
    if (named.length === 1) return { act: { type: "unit", id: named[0].id }, suggest: ["presentation", "call"], text: { ka: `აი, ბინა ${named[0].number}, ბლოკი ${named[0].block.slice(1)}.`, en: `Here is apartment ${named[0].number}, block ${named[0].block.slice(1)}.` } };
    if (named.length > 1)
      return {
        units: named.map((u) => u.id),
        text: { ka: `ბინა ${named[0].number} რამდენიმე ბლოკშია. რომელი გაინტერესებთ?`, en: `There is an apartment ${named[0].number} in several blocks. Which one?` },
      };

    const spot = floorIn(q);
    if (spot) return { act: { type: "floor", ...spot }, suggest: ["presentation", "call"] };

    const wish = wishIn(q);
    if (wish) {
      const list = matches(wish);
      if (list.length)
        return {
          units: list.slice(0, 4).map((u) => u.id),
          // Offer what the question did not already narrow down.
          suggest: (
            [
              !wish.view && "seaView",
              !wish.high && !wish.low && "highFloor",
              wish.bedrooms !== 2 && "twoBed",
              wish.bedrooms !== 3 && "threeBed",
            ].filter(Boolean) as SuggestionId[]
          )
            .slice(0, 2)
            .concat("presentation", "call"),
          text: wishText(wish, list.length),
          offer: { type: "unit", id: list[0].id },
        };
      return {
        ...CALL,
        text: {
          ka: "ასეთი ბინა ახლა თავისუფალი არ გვაქვს. შეგიძლიათ კრიტერიუმები შეცვალოთ, ან დატოვოთ ნომერი — როგორც კი გამოჩნდება, დაგირეკავთ.",
          en: "We have no such apartment free right now. You can change what you're looking for, or leave your number and we'll call you when one comes up.",
        },
        suggest: ["sizes", "seaView"],
      };
    }

    for (const t of TOPICS.slice(1)) if (has(q, t.stems)) return typeof t.reply === "function" ? t.reply(q, context) : t.reply;
    return NO_ANSWER;
  },
};

/** Apartment cards in the chat: the words for one unit. */
export const unitCard = (id: string) => units.find((u) => u.id === id);
