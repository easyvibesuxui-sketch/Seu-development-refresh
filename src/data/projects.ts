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
    coords: [44.8762, 41.7121],
    floors: 12,
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
    id: "jikia",
    name: "SEU Jikia",
    status: "finished",
    date: "01.02.2025",
    district: "Varketili",
    sizes: [64, 250],
    coords: [44.8548, 41.6903],
    floors: 14,
    overviewSpread: { x: 0, label: "below" },
    image: "/images/finished-vaja.jpg",
    imagePosition: "50% 70%",
  },
  {
    id: "politkovskaya",
    name: "SEU Politkovskaya",
    status: "finished",
    date: "2019",
    district: "Saburtalo",
    sizes: [52, 180],
    coords: [44.7024, 41.7216],
    floors: 16,
    overviewSpread: { x: -42, label: "above" },
    image: "/images/finished-vaja.jpg",
    imagePosition: "20% 40%",
  },
  {
    id: "vasilisko",
    name: "SEU Vasilisko",
    status: "finished",
    date: "2021",
    district: "Saburtalo",
    sizes: [48, 140],
    coords: [44.7049, 41.7199],
    floors: 12,
    overviewSpread: { x: 42, label: "below" },
    image: "/images/finished-vaja.jpg",
    imagePosition: "80% 50%",
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
