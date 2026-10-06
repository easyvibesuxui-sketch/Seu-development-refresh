import { units, type RoomKind, type UnitStatus, type ViewId } from "./inventory";

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
};

export const MODELS: Model[] = [
  {
    id: "green-yard",
    project: "green-yard",
    name: { ka: "SEU Green Yard", en: "SEU Green Yard" },
    note: { ka: "დასრულებული · ჯიქიას ქუჩა", en: "Finished · Jikia Street" },
    at: { x: 13, y: 57 },
    href: "/projects/green-yard/",
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
    at: { x: 87.5, y: 54 },
    href: "/projects/vasilisko/",
  },
];

/**
 * The Varketili model close-up (`maquette-varketili.jpg`): the front face of each built block,
 * in percent of the frame, split into floor bands by the block's floor count.
 */
export const MAQUETTE = "/assistant/maquette-varketili.jpg";
export const MAQUETTE_RATIO = 5504 / 3072;
export const FACADES: { block: string; x: [number, number]; y: [number, number] }[] = [
  { block: "v2", x: [22.1, 28.8], y: [37.5, 65] },
  { block: "v3", x: [28.9, 37.2], y: [36.8, 71] },
  { block: "v4", x: [37.5, 46], y: [42.2, 73.7] },
  { block: "v6", x: [49.1, 59.6], y: [39.8, 76.8] },
  { block: "v7", x: [61.5, 71.8], y: [39.1, 80] },
];

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

const fromPrice = Math.min(...units.filter((u) => u.status !== "sold").map((u) => u.price));
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

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
    ka: `ბინები გვაქვს SEU ვარკეთილში, სტუდიოდან სამსაძინებლიანამდე, ${usd(fromPrice)}-დან. მოდით, მაკეტზე გაჩვენებთ.`,
    en: `We have apartments at SEU Varketili, from studios to three bedrooms, from ${usd(fromPrice)}. Let me show you on the model.`,
  },
  varketili: {
    ka: "SEU ვარკეთილი თბილისის ზღვასთან ახლოსაა. რომელი კორპუსი და რომელი სართული გაინტერესებთ? მიიტანეთ სართულზე და დააჭირეთ, გაჩვენებთ გეგმას.",
    en: "SEU Varketili sits close to the Tbilisi Sea. Which block and which floor interest you? Point at a floor on the model and click it, and I'll show you the plan.",
  },
  floor: {
    ka: "აი, ამ სართულის გეგმა. თავისუფალ ბინაზე დააჭირეთ და დეტალებს გაჩვენებთ.",
    en: "Here is the plan of this floor. Click an available apartment and I'll show you the details.",
  },
  finished: {
    ka: "ეს პროექტი უკვე დასრულებული და დასახლებულია. ახლა ბინები SEU ვარკეთილშია, გაჩვენოთ?",
    en: "This project is finished and lived in. Apartments are available now at SEU Varketili. Shall I show you?",
  },
  prices: {
    ka: `ვარკეთილში ბინების ფასი ${usd(fromPrice)}-დან იწყება, დაახლოებით $1,000-დან კვადრატულ მეტრზე. ზუსტ ფასს თითოეული ბინის გვერდზე ნახავთ.`,
    en: `Apartments at Varketili start from ${usd(fromPrice)}, around $1,000 per m². Each apartment's page shows its exact price.`,
  },
  visit: {
    ka: "სიამოვნებით შეგხვდებით ოფისში. დატოვეთ ნომერი და გადმოგირეკავთ.",
    en: "I would be glad to meet you at the office. Leave your number and we will call you back.",
  },
} satisfies Record<string, Line>;

export type Reply = { id: "projects" | "buy" | "prices" | "visit" | "varketili"; label: Line };

export const REPLIES: Reply[] = [
  { id: "projects", label: { ka: "პროექტების ნახვა", en: "Show me the projects" } },
  { id: "buy", label: { ka: "ბინის ყიდვა მინდა", en: "I want to buy an apartment" } },
  { id: "prices", label: { ka: "რა ღირს?", en: "What are the prices?" } },
  { id: "visit", label: { ka: "ვიზიტის დაჯავშნა", en: "Book a visit" } },
];

export const UI = {
  enter: { ka: "შესვლა", en: "Come in" },
  enterHint: { ka: "ხმა ჩაირთვება, როცა მზად იქნება", en: "Sound will play once it is recorded" },
  skip: { ka: "გამოტოვება", en: "Skip" },
  back: { ka: "უკან", en: "Back" },
  toShowroom: { ka: "შოურუმში დაბრუნება", en: "Back to the showroom" },
  showVarketili: { ka: "ვარკეთილის ჩვენება", en: "Show me Varketili" },
  block: { ka: "კორპუსი", en: "Block" },
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
  price: { ka: "ფასი", en: "Price" },
  rooms: { ka: "ოთახები", en: "Room by room" },
  views: { ka: "ხედები", en: "Views" },
  name: { ka: "სახელი", en: "Name" },
  phone: { ka: "ტელეფონი", en: "Phone" },
  send: { ka: "გადმორეკვის თხოვნა", en: "Request a call" },
  thanks: { ka: "მადლობა! მალე დაგირეკავთ.", en: "Thank you! We will call you shortly." },
  sampleNote: { ka: "გეგმები და ფასები საილუსტრაციოა.", en: "Plans and prices are illustrative." },
  chat: { ka: "კითხვა მარიამს", en: "Ask Mariam" },
  chatSoon: { ka: "თავისუფალი კითხვები მალე. ჯერ აირჩიეთ:", en: "Free questions are coming soon. For now, choose:" },
  models: { ka: "მაკეტები", en: "Models" },
  call: { ka: "ზარის მოთხოვნა", en: "Request a call" },
} satisfies Record<string, Line>;
