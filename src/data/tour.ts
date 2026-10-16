/*
 * The virtual tour on the apartment profile (Matterport-style): one sample apartment in six
 * places, generated with Kling (see docs/assistant.md, "Virtual tour (apartment profile)"). Each place is a wide
 * still you can look around in; rings on the floor walk you to the next place through a short
 * Kling clip that starts on this view and ends on the next one.
 *
 * Positions are fractions of the image (x across, y down). A walk clip's first frame is the
 * 16:9 crop of the current place centred on `from`, its last frame the crop of the next place
 * centred on `land`, so the still, the clip and the next still meet without a jump.
 */

export type TourPlace = "hall" | "living" | "bed1" | "bed2" | "bath" | "balcony";

export type TourLink = {
  to: TourPlace;
  /** The ring on the floor, as fractions of the image. */
  x: number;
  y: number;
  /** A walk clip (public/tour/walk-<clip>.mp4 and .webm), with where it starts here and lands there. */
  clip?: string;
  from?: number;
  land?: number;
};

export type TourStop = {
  id: TourPlace;
  name: [en: string, ka: string];
  src: string;
  /** Width / height of the still. */
  aspect: number;
  /** Where the view opens when you arrive without a clip. */
  start: number;
  /** Alpha mask of the painted walls, for the wall colours. */
  walls?: string;
  links: TourLink[];
  /** Marker on the dollhouse and on the top-down plan. */
  doll: [number, number];
  plan: [number, number];
};

const W21 = 3168 / 1344;

export const TOUR: TourStop[] = [
  {
    id: "hall",
    name: ["Entrance hall", "შესასვლელი"],
    src: "/tour/hall.jpg",
    aspect: W21,
    start: 0.5,
    walls: "/tour/hall-walls.png",
    links: [
      { to: "living", x: 0.8, y: 0.84, clip: "hall-living", from: 0.62, land: 0.5 },
      { to: "bed1", x: 0.415, y: 0.8, clip: "hall-bed1", from: 0.43, land: 0.5 },
      { to: "bath", x: 0.51, y: 0.8, clip: "hall-bath", from: 0.5, land: 0.5 },
      { to: "bed2", x: 0.33, y: 0.84, clip: "hall-bed2", from: 0.38, land: 0.5 },
    ],
    doll: [0.66, 0.3],
    plan: [0.64, 0.24],
  },
  {
    id: "living",
    name: ["Living room & kitchen", "მისაღები და სამზარეულო"],
    src: "/images/pano-apartment.jpg",
    aspect: 5120 / 1315,
    start: 0.5,
    walls: "/tour/living-walls.png",
    links: [
      { to: "balcony", x: 0.9, y: 0.84, clip: "living-balcony", from: 0.77, land: 0.5 },
      { to: "hall", x: 0.08, y: 0.84 },
    ],
    doll: [0.41, 0.42],
    plan: [0.3, 0.4],
  },
  {
    id: "bed1",
    name: ["Main bedroom", "საძინებელი"],
    src: "/tour/bed1.jpg",
    aspect: W21,
    start: 0.5,
    walls: "/tour/bed1-walls.png",
    links: [{ to: "hall", x: 0.2, y: 0.84 }],
    doll: [0.53, 0.53],
    plan: [0.55, 0.62],
  },
  {
    id: "bed2",
    name: ["Second bedroom", "მეორე საძინებელი"],
    src: "/tour/bed2.jpg",
    aspect: W21,
    start: 0.5,
    walls: "/tour/bed2-walls.png",
    links: [{ to: "hall", x: 0.12, y: 0.84 }],
    doll: [0.73, 0.66],
    plan: [0.8, 0.6],
  },
  {
    id: "bath",
    name: ["Bathroom", "სააბაზანო"],
    src: "/tour/bath.jpg",
    aspect: W21,
    start: 0.5,
    walls: "/tour/bath-walls.png",
    links: [{ to: "hall", x: 0.15, y: 0.84 }],
    doll: [0.86, 0.42],
    plan: [0.84, 0.3],
  },
  {
    id: "balcony",
    name: ["Balcony", "აივანი"],
    src: "/tour/balcony.jpg",
    aspect: W21,
    start: 0.5,
    links: [{ to: "living", x: 0.22, y: 0.84 }],
    doll: [0.3, 0.69],
    plan: [0.36, 0.86],
  },
];

export const tourStop = (id: TourPlace) => TOUR.find((s) => s.id === id)!;

/** Wall colours to try; null keeps the walls as built. Multiplied over the warm white paint. */
export const WALL_COLOURS: { id: string; name: [en: string, ka: string]; hex: string | null }[] = [
  { id: "built", name: ["As built", "როგორც არის"], hex: null },
  { id: "sand", name: ["Sand", "ქვიშა"], hex: "#e6cfae" },
  { id: "sage", name: ["Sage", "სალბი"], hex: "#c4cdb2" },
  { id: "clay", name: ["Clay", "თიხა"], hex: "#e2b59a" },
  { id: "mist", name: ["Mist blue", "ნისლისფერი"], hex: "#c2d0d8" },
  { id: "graphite", name: ["Graphite", "გრაფიტი"], hex: "#8d918e" },
];
