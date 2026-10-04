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
    image: "/images/finished-vaja.jpg",
    imagePosition: "80% 50%",
  },
];

export type MappedProject = Project & { coords: [number, number] };

export const mappedProjects = projects.filter((p): p is MappedProject => Boolean(p.coords));

export const withBase = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
