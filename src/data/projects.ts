import type { Lang } from "@/lib/i18n";

export type ProjectStatus = "ongoing" | "upcoming" | "finished";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  date: string;
  district: string;
  sizes: [number, number];
  /** [lng, lat]; projects without a site yet are not shown on the map. */
  coords?: [number, number];
  /** Under construction, so not in OpenStreetMap yet: drawn as stylised towers. */
  drawTowers?: boolean;
  floors: number;
  image: string;
  imagePosition?: string;
  videoId?: string;
  /** Overview-only nudge (px) for projects that sit too close together at city scale. */
  overviewSpread?: { x: number; label: "above" | "below" };
};

export const statusLabel: Record<ProjectStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Starting",
  finished: "Finished",
};

// Map coordinates come from the OpenStreetMap geometry of each project's street.
export const projects: Project[] = [
  {
    id: "varketili",
    name: "SEU Varketili",
    status: "ongoing",
    date: "01.02.2028",
    district: "Varketili",
    sizes: [45, 116],
    // Approximate: Viktor Kupradze St 22 is not mapped in OpenStreetMap yet.
    coords: [44.8762, 41.7121],
    floors: 12,
    drawTowers: true,
    image: "/images/choose-varketili.jpg",
    videoId: "6dCWXfB7nvc",
  },
  {
    id: "varketili-2",
    name: "SEU Varketili II",
    status: "upcoming",
    date: "01.02.2028",
    district: "Varketili",
    sizes: [50, 140],
    floors: 16,
    image: "/images/upcoming-1.jpg",
  },
  {
    id: "varketili-3",
    name: "SEU Varketili III",
    status: "upcoming",
    date: "01.09.2028",
    district: "Varketili",
    sizes: [50, 160],
    floors: 18,
    image: "/images/upcoming-2.jpg",
  },
  {
    id: "green-yard",
    name: "SEU Green Yard",
    status: "finished",
    date: "2019",
    district: "Saburtalo",
    sizes: [52, 180],
    // OSM housenumber 32 on Anna Politkovskaya St; the 19-storey towers stand here.
    coords: [44.70705, 41.72052],
    floors: 19,
    image: "/images/finished-vaja.jpg",
    imagePosition: "20% 40%",
    overviewSpread: { x: 46, label: "above" },
  },
  {
    id: "vasilisko",
    name: "SEU Vasilisko",
    status: "finished",
    date: "2021",
    district: "Saburtalo",
    sizes: [48, 140],
    // OSM housenumber 1 on Holy Martyr Vasilisko St (complex at 1-3).
    coords: [44.70141, 41.72046],
    floors: 12,
    image: "/images/finished-vaja.jpg",
    imagePosition: "80% 50%",
    overviewSpread: { x: -46, label: "below" },
  },
];

export type MappedProject = Project & { coords: [number, number] };

export const mappedProjects = projects.filter((p): p is MappedProject => Boolean(p.coords));

export const withBase = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export type Highlight = {
  id: string;
  name: string;
  kind: "metro" | "mall" | "park";
  /** [lng, lat] from OpenStreetMap */
  coords: [number, number];
  /** Project this landmark is shown around. */
  project: string;
};

export const highlights: Highlight[] = [
  { id: "varketili-metro", name: "Varketili Metro", kind: "metro", coords: [44.87088, 41.6919], project: "varketili" },
  { id: "hualing-plaza", name: "Hualing Tbilisi Sea Plaza", kind: "mall", coords: [44.85973, 41.70853], project: "varketili" },
  { id: "east-point", name: "East Point", kind: "mall", coords: [44.89846, 41.68996], project: "varketili" },
  { id: "hualing-park", name: "Hualing Park", kind: "park", coords: [44.87363, 41.71811], project: "varketili" },
];

/** Straight-line distance in km, used for the "x km" hint on landmark pins. */
export function distanceKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/* Georgian names for the site's Georgian pages (see lib/i18n). Brand names stay as they are. */
const KA_NAME: Record<string, string> = {
  varketili: "SEU ვარკეთილი",
  "varketili-2": "SEU ვარკეთილი II",
  "varketili-3": "SEU ვარკეთილი III",
  "green-yard": "SEU Green Yard",
  vasilisko: "SEU ვასილისკო",
  "varketili-metro": "მეტრო ვარკეთილი",
  "hualing-plaza": "Hualing Tbilisi Sea Plaza",
  "east-point": "East Point",
  "hualing-park": "ჰუალინგის პარკი",
};
const KA_DISTRICT: Record<string, string> = { Varketili: "ვარკეთილი", Saburtalo: "საბურთალო" };
const KA_STATUS: Record<ProjectStatus, string> = { ongoing: "მიმდინარე", upcoming: "იწყება", finished: "დასრულებული" };

/** A project's or landmark's name in the page's language. */
export const nameIn = (item: { id: string; name: string }, lang: Lang) => (lang === "ka" ? (KA_NAME[item.id] ?? item.name) : item.name);
export const districtIn = (district: string, lang: Lang) => (lang === "ka" ? (KA_DISTRICT[district] ?? district) : district);
export const statusIn = (status: ProjectStatus, lang: Lang) => (lang === "ka" ? KA_STATUS[status] : statusLabel[status]);
