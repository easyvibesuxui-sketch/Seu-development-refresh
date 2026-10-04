export type ProjectStatus = "ongoing" | "upcoming" | "finished";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  date: string;
  district: string;
  sizes: [number, number];
  /** [lng, lat] */
  coords: [number, number];
  floors: number;
};

// Coordinates come from the OpenStreetMap street geometry of each address.
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
  },
];
