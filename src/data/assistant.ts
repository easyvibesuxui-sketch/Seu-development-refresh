import { type RoomKind, type UnitStatus, type ViewId } from "./inventory";

/*
 * The virtual assistant's script and stage. One consultant, Mariam, in one showroom: every
 * clip and still of her comes from the same reference set (see docs/assistant.md), so she
 * never changes between scenes. Lines exist in Georgian and English; the voice is recorded
 * later, the subtitles carry the words until then.
 */

export type Lang = "ka" | "en";
export type Line = Record<Lang, string>;

export const ASSISTANT_NAME: Line = { ka: "მარიამი", en: "Mariam" };

/** The scale models in the showroom, placed on the showroom frame in percent. */
export type Model = {
  id: string;
  project: string;
  name: Line;
  note: Line;
  at: { x: number; y: number };
  /** Close-up of the model the zoom lands on before the live map takes over. */
  closeup?: string;
  /** Where choosing this project leads on the website. */
  href: string;
  /** Finished projects: the presentation film the zoom lands on, and the facts shown with it. */
  film?: string;
  facts?: { address: Line; year: string; floors: number };
};

export const MODELS: Model[] = [
  {
    id: "green-yard",
    project: "green-yard",
    name: { ka: "SEU Green Yard", en: "SEU Green Yard" },
    note: { ka: "დასრულებული · ჯიქიას ქუჩა", en: "Finished · Jikia Street" },
    at: { x: 14, y: 47 },
    href: "/projects/green-yard/",
    film: "/assistant/film-green-yard",
    facts: { address: { ka: "ანა პოლიტკოვსკაიას ქ. 32, საბურთალო", en: "32 Anna Politkovskaya St, Saburtalo" }, year: "2019", floors: 19 },
  },
  {
    id: "varketili",
    project: "varketili",
    name: { ka: "SEU ვარკეთილი", en: "SEU Varketili" },
    note: { ka: "მიმდინარე · ფერადი შენდება, თეთრი დაგეგმილია", en: "Ongoing · colour is under way, white is planned" },
    at: { x: 54, y: 52 },
    closeup: "/assistant/maquette-varketili.jpg",
    href: "/projects/varketili/",
  },
  {
    id: "vasilisko",
    project: "vasilisko",
    name: { ka: "SEU ვასილისკო", en: "SEU Vasilisko" },
    note: { ka: "დასრულებული · საბურთალო", en: "Finished · Saburtalo" },
    at: { x: 87, y: 47 },
    href: "/projects/vasilisko/",
    film: "/assistant/film-vasilisko",
    facts: { address: { ka: "წმ. მოწამე ვასილისკოს ქ. 1–3, საბურთალო", en: "1–3 Holy Martyr Vasilisko St, Saburtalo" }, year: "2021", floors: 12 },
  },
];

/**
 * The Varketili model close-up (`maquette-varketili.jpg`), measured floor by floor. Each part is
 * one face of a block: its left and right edges, and the floor lines from the roof down, read
 * at each edge (in percent of the frame), so the floors follow the model's perspective. Floors
 * count down from the part's `top` floor (the block's highest unless given), as on the website;
 * the ground floor and anything hidden behind the trees is left out.
 */
export const MAQUETTE = "/assistant/maquette-varketili.jpg";
export const MAQUETTE_RATIO = 5504 / 3072;
export type FacadePart = { x: [number, number]; l: number[]; r: number[]; top?: number };
export const FACADES: { block: string; parts: FacadePart[] }[] = [
  {
    block: "v2",
    parts: [
      {
        x: [22.15, 28.94],
        l: [37.62, 40.97, 43.49, 46, 48.67, 50.76, 53.28, 55.87, 58.5, 61.2, 63.9],
        r: [37.62, 41.02, 43.59, 46.15, 48.87, 51.01, 53.58, 56.22, 58.9, 61.65, 64.4],
      },
    ],
  },
  {
    block: "v3",
    parts: [
      {
        x: [28.98, 37.2],
        l: [37.6, 40.1, 42.9, 45.6, 48.4, 51.1, 54.4, 57, 60.1, 63.33, 66.75, 69.63],
        r: [37.75, 40.8, 43.6, 46.5, 49.25, 52.13, 53.95, 57.9, 61.05, 64.2, 67.55, 70.8],
      },
    ],
  },
  {
    block: "v4",
    parts: [
      { x: [37.6, 45.9], l: [43.38, 46.44, 49.5, 52.73, 54.4], r: [43.38, 46.6, 49.84, 53.24, 55.45] },
      { x: [37.55, 44.7], l: [54.4, 58.78, 62.02, 65.29, 68.5, 71.72], r: [55.45, 60.16, 63.5, 66.98, 70.33, 73.45], top: 8 },
    ],
  },
  {
    block: "v6",
    parts: [
      {
        x: [49.15, 59.9],
        l: [40.06, 44.58, 47.81, 51.01, 54.26, 57.49, 60.77, 64],
        r: [40.64, 44.93, 48.39, 51.88, 55.42, 58.86, 62.37, 65.88],
      },
      { x: [48.34, 59.35], l: [64.24, 67.74, 71.24, 74.74, 78.24], r: [66.66, 70.18, 73.7, 77.27, 80.8], top: 5 },
    ],
  },
  {
    block: "v7",
    parts: [
      {
        x: [61.45, 68.07],
        l: [39.12, 43.93, 47.23, 50.69, 54.15, 57.63, 61.04, 64.6, 68.3, 72.1, 75.65, 79.2],
        r: [39.41, 44.35, 47.95, 51.54, 55.13, 58.61, 62.16, 65.8, 69.45, 73.1, 76.8, 80.45],
      },
      {
        x: [68.07, 72.1],
        l: [39.41, 44.35, 47.95, 51.54, 55.13, 58.61, 62.16, 65.8, 69.45, 73.1, 76.8, 80.45],
        r: [38.63, 43.13, 46.3, 49.46, 52.8, 56.13, 59.5, 63, 66.5, 70, 73.6, 77.1],
      },
    ],
  },
];

/** Every selectable floor outline on the close-up: one polygon per face the floor crosses. */
export function facadeFloors(floors: (block: string) => number) {
  return FACADES.flatMap(({ block, parts }) =>
    parts.flatMap((p) => {
      const top = p.top ?? floors(block);
      return p.l.slice(1).map((_, i) => ({
        block,
        floor: top - i,
        points: [
          [p.x[0], p.l[i]],
          [p.x[1], p.r[i]],
          [p.x[1], p.r[i + 1]],
          [p.x[0], p.l[i + 1]],
        ],
      }));
    }),
  ).filter((f) => f.floor >= 2);
}

/** Where a block's label sits: above the middle of its roof line. */
export const facadeLabel = (f: (typeof FACADES)[number]) => {
  const p = f.parts[0];
  return { x: (p.x[0] + p.x[1]) / 2, y: Math.min(p.l[0], p.r[0]) - 1 };
};

export const STATUS: Record<UnitStatus, Line> = {
  available: { ka: "თავისუფალი", en: "Available" },
  reserved: { ka: "დაჯავშნილი", en: "Reserved" },
  sold: { ka: "გაყიდული", en: "Sold" },
};

export const ROOM: Record<RoomKind, Line> = {
  living: { ka: "მისაღები", en: "Living room" },
  kitchen: { ka: "სამზარეულო", en: "Kitchen" },
  bedroom: { ka: "საძინებელი", en: "Bedroom" },
  bathroom: { ka: "სააბაზანო", en: "Bathroom" },
  wc: { ka: "სველი წერტილი", en: "WC" },
  hall: { ka: "დერეფანი", en: "Hall" },
  balcony: { ka: "აივანი", en: "Balcony" },
  storage: { ka: "სათავსო", en: "Storage" },
};

export const VIEW: Record<ViewId, Line> = {
  park: { ka: "ჰუალინგის პარკი", en: "Hualing Park" },
  city: { ka: "ქალაქი", en: "City" },
  sea: { ka: "თბილისის ზღვა", en: "Tbilisi Sea" },
  mountains: { ka: "მთები", en: "Mountains" },
  courtyard: { ka: "ეზო", en: "Courtyard" },
  panorama: { ka: "პანორამა", en: "Panorama" },
};


export const LINES = {
  greet: {
    ka: "გამარჯობა, კეთილი იყოს თქვენი მობრძანება SEU Development-ში! მე მარიამი ვარ. რისი შეძენა გსურთ, თუ დაგათვალიერებინოთ ჩვენი პროექტები?",
    en: "Hello and welcome to SEU Development! I'm Mariam. What are you looking to buy, or shall I show you around our projects?",
  },
  showroom: {
    ka: "აქ ჩვენი პროექტების მაკეტებია. ცენტრში მიმდინარე SEU ვარკეთილია: ფერადი კორპუსები უკვე შენდება, თეთრი დაგეგმილია. მარცხნივ დასრულებული Green Yard-ია ჯიქიას ქუჩაზე, მარჯვნივ ვასილისკო. დააჭირეთ მაკეტს, რომელიც გაინტერესებთ.",
    en: "These are the models of our projects. In the centre is SEU Varketili, under way now: the coloured blocks are being built, the white ones are planned. On the left is the finished Green Yard on Jikia Street, on the right Vasilisko. Click the model you are interested in.",
  },
  buy: {
    ka: "ბინები გვაქვს SEU ვარკეთილში, სტუდიოდან სამსაძინებლიანამდე. მოდით, მაკეტზე გაჩვენებთ.",
    en: "We have apartments at SEU Varketili, from studios to three bedrooms. Let me show you on the model.",
  },
  varketili: {
    ka: "SEU ვარკეთილი თბილისის ზღვასთან ახლოსაა. რომელი კორპუსი და რომელი სართული გაინტერესებთ? მიიტანეთ სართულზე და დააჭირეთ, გაჩვენებთ გეგმას.",
    en: "SEU Varketili sits close to the Tbilisi Sea. Which block and which floor interest you? Point at a floor on the model and click it, and I'll show you the plan.",
  },
  floor: {
    ka: "აი, ამ სართულის გეგმა. თავისუფალ ბინაზე დააჭირეთ და დეტალებს გაჩვენებთ.",
    en: "Here is the plan of this floor. Click an available apartment and I'll show you the details.",
  },
  // Recorded as the first sentence of the earlier "finished" line (cut in media/job.json).
  done: {
    ka: "ეს პროექტი უკვე დასრულებული და დასახლებულია.",
    en: "This project is finished and lived in.",
  },
  visit: {
    ka: "სიამოვნებით შეგხვდებით ოფისში. დატოვეთ ნომერი და გადმოგირეკავთ.",
    en: "I would be glad to meet you at the office. Leave your number and we will call you back.",
  },
} satisfies Record<string, Line>;

/**
 * Greeting clips whose lips follow the recorded greeting (made in media/job.json); a language
 * without one plays the plain greeting clip.
 */
export const SYNCED_GREETING: Partial<Record<Lang, string>> = { ka: "greet-ka" };

export type LineId = keyof typeof LINES;
export const lineId = (line: Line) => (Object.keys(LINES) as LineId[]).find((k) => LINES[k] === line);

export type Reply = { id: "projects" | "buy" | "visit" | "varketili"; label: Line };

export const REPLIES: Reply[] = [
  { id: "projects", label: { ka: "პროექტების ნახვა", en: "Show me the projects" } },
  { id: "buy", label: { ka: "ბინის ყიდვა მინდა", en: "I want to buy an apartment" } },
  { id: "visit", label: { ka: "ვიზიტის დაჯავშნა", en: "Book a visit" } },
];

export const UI = {
  enter: { ka: "შესვლა", en: "Come in" },
  sound: { ka: "მარიამის ხმა", en: "Mariam's voice" },
  skip: { ka: "გამოტოვება", en: "Skip" },
  back: { ka: "უკან", en: "Back" },
  toShowroom: { ka: "შოურუმში დაბრუნება", en: "Back to the showroom" },
  replay: { ka: "თავიდან ნახვა", en: "Watch again" },
  finishedIn: { ka: "დასრულდა", en: "Finished" },
  floorsCount: { ka: "სართული", en: "floors" },
  film: { ka: "საპრეზენტაციო ფილმი", en: "Presentation film" },
  block: { ka: "ბლოკი", en: "Block" },
  floor: { ka: "სართული", en: "Floor" },
  pickFloor: { ka: "სართულის არჩევა", en: "Choose a floor" },
  showPlan: { ka: "გეგმის ჩვენება", en: "Show the plan" },
  available: { ka: "თავისუფალი", en: "available" },
  of: { ka: "-დან", en: "of" },
  from: { ka: "დან", en: "from" },
  apartment: { ka: "ბინა", en: "Apartment" },
  apartments: { ka: "ბინები", en: "Apartments" },
  floorPlan: { ka: "სართულის გეგმა", en: "Floor plan" },
  backToFloor: { ka: "სართულზე დაბრუნება", en: "Back to the floor" },
  total: { ka: "საერთო ფართი", en: "Total size" },
  living: { ka: "საცხოვრებელი", en: "Main size" },
  open: { ka: "აივანი", en: "Open space" },
  bedrooms: { ka: "საძინებელი", en: "Bedrooms" },
  studio: { ka: "სტუდიო", en: "Studio" },
  rooms: { ka: "ოთახები", en: "Room by room" },
  views: { ka: "ხედები", en: "Views" },
  name: { ka: "სახელი", en: "Name" },
  phone: { ka: "ტელეფონი", en: "Phone" },
  send: { ka: "გადმორეკვის თხოვნა", en: "Request a call" },
  thanks: { ka: "მადლობა! მალე დაგირეკავთ.", en: "Thank you! We will call you shortly." },
  sampleNote: { ka: "გეგმები საილუსტრაციოა.", en: "Plans are illustrative." },
  chat: { ka: "კითხვა მარიამს", en: "Ask Mariam" },
  chatHint: { ka: "მკითხეთ, რაც გაინტერესებთ, ან აირჩიეთ:", en: "Ask me anything, or choose:" },
  chatPlaceholder: { ka: "დაწერეთ კითხვა…", en: "Type a question…" },
  chatSend: { ka: "გაგზავნა", en: "Send" },
  chatClose: { ka: "ჩატის დახურვა", en: "Close the chat" },
  typing: { ka: "მარიამი წერს…", en: "Mariam is typing…" },
  models: { ka: "მაკეტები", en: "Models" },
  call: { ka: "ზარის მოთხოვნა", en: "Request a call" },
  pdf: { ka: "PDF პრეზენტაცია", en: "PDF presentation" },
  newTab: { ka: "(იხსნება ახალ ჩანართში)", en: "(opens in a new tab)" },
  layout: { ka: "განლაგების ხედი", en: "Layout view" },
  planTab: { ka: "გეგმა", en: "Plan" },
  north: { ka: "ჩრდილოეთის ისარი", en: "North arrow" },
  onFloor: { ka: "ბინა სართულზე", en: "Where it is on the floor" },
  delivery: { ka: "ჩაბარება", en: "Delivery" },
  delivered: { ka: "ჩაბარებულია", en: "Delivered" },
} satisfies Record<string, Line>;
