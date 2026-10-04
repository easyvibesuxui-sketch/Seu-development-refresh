/*
 * SEU Varketili inventory used by the visual search, block, apartment and search pages.
 *
 * Block names, storey counts, delivery status, the 43–116 m² size range and the
 * "from $1,000 per m²" price come from public listings (korter.ge, Nov 2025).
 * Individual unit numbers, layouts, statuses and prices are SAMPLE DATA for this concept,
 * generated deterministically so every build shows the same inventory. Replace with the
 * developer's real feed before launch.
 */

export type UnitStatus = "available" | "reserved" | "sold";

export type Room = { kind: RoomKind; area: number };
export type RoomKind = "living" | "kitchen" | "bedroom" | "bathroom" | "wc" | "hall" | "balcony" | "storage";

export type Unit = {
  id: string;
  number: number;
  project: string;
  block: string;
  floor: number;
  /** Position on the floor plate, 0–6 (four units on the north side, three on the south). */
  slot: number;
  bedrooms: number;
  totalArea: number;
  livingArea: number;
  openArea: number;
  pricePerM2: number;
  price: number;
  status: UnitStatus;
  discounted: boolean;
  rooms: Room[];
};

export type Block = {
  id: string;
  name: string;
  floors: number;
  status: "delivered" | "under_construction";
  delivery: string;
  /** Position on the site plan (percent of the plan box). */
  plan: { x: number; y: number; w: number; h: number };
};

export const varketiliBlocks: Block[] = [
  { id: "v2", name: "Block 2", floors: 12, status: "under_construction", delivery: "Q2 2026", plan: { x: 8, y: 6, w: 14, h: 26 } },
  { id: "v3", name: "Block 3", floors: 11, status: "delivered", delivery: "2023", plan: { x: 8, y: 66, w: 22, h: 18 } },
  { id: "v4", name: "Block 4", floors: 12, status: "under_construction", delivery: "Q4 2026", plan: { x: 52, y: 52, w: 22, h: 18 } },
  { id: "v6", name: "Block 6", floors: 12, status: "under_construction", delivery: "Q4 2026", plan: { x: 72, y: 20, w: 22, h: 14 } },
  { id: "v7", name: "Block 7", floors: 12, status: "under_construction", delivery: "Q2 2026", plan: { x: 8, y: 36, w: 22, h: 14 } },
];

// Seven layouts per floor, within the published 43–116 m² range.
const LAYOUTS: { bedrooms: number; total: number }[] = [
  { bedrooms: 0, total: 43.6 },
  { bedrooms: 1, total: 52.8 },
  { bedrooms: 2, total: 69.4 },
  { bedrooms: 3, total: 96.2 },
  { bedrooms: 2, total: 74.1 },
  { bedrooms: 1, total: 58.3 },
  { bedrooms: 3, total: 116.2 },
];

/** Small deterministic PRNG so sample data is stable between builds. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function roomsFor(bedrooms: number, total: number, rand: () => number): Room[] {
  const r = (n: number) => Math.round(n * 10) / 10;
  const rooms: Room[] = [];
  const bedroomArea = bedrooms ? (total * 0.42) / bedrooms : 0;
  for (let i = 0; i < bedrooms; i++) rooms.push({ kind: "bedroom", area: r(bedroomArea * (0.9 + rand() * 0.2)) });
  rooms.push({ kind: "living", area: r(total * (bedrooms ? 0.22 : 0.5)) });
  rooms.push({ kind: "kitchen", area: r(total * 0.1) });
  rooms.push({ kind: "bathroom", area: r(4.2 + rand() * 1.5) });
  if (bedrooms >= 2) rooms.push({ kind: "wc", area: r(2.1 + rand() * 0.6) });
  rooms.push({ kind: "hall", area: r(total * 0.07) });
  rooms.push({ kind: "balcony", area: r(3.5 + rand() * 4) });
  if (bedrooms >= 3) rooms.push({ kind: "storage", area: r(2 + rand()) });
  return rooms;
}

function buildInventory(): Unit[] {
  const units: Unit[] = [];
  varketiliBlocks.forEach((block, bi) => {
    const rand = seeded(1000 + bi * 97);
    for (let floor = 2; floor <= block.floors; floor++) {
      LAYOUTS.forEach((layout, slot) => {
        const number = floor * 100 + slot + 1;
        const roll = rand();
        // The delivered block is mostly sold; higher floors sell faster.
        const soldShare = block.status === "delivered" ? 0.82 : 0.18 + floor / 60;
        const status: UnitStatus = roll < soldShare ? "sold" : roll < soldShare + 0.14 ? "reserved" : "available";
        const pricePerM2 = Math.round(1000 + floor * 18 + layout.bedrooms * 25 + rand() * 60);
        const openArea = Math.round((3.5 + rand() * 6) * 10) / 10;
        units.push({
          id: `varketili-${block.id}-${number}`,
          number,
          project: "varketili",
          block: block.id,
          floor,
          slot,
          bedrooms: layout.bedrooms,
          totalArea: layout.total,
          livingArea: Math.round((layout.total - openArea) * 10) / 10,
          openArea,
          pricePerM2,
          price: Math.round((pricePerM2 * layout.total) / 100) * 100,
          status,
          discounted: status === "available" && rand() < 0.12,
          rooms: roomsFor(layout.bedrooms, layout.total, rand),
        });
      });
    }
  });
  return units;
}

export const units: Unit[] = buildInventory();

export const unitById = (id: string) => units.find((u) => u.id === id);
export const blockById = (id: string) => varketiliBlocks.find((b) => b.id === id);
export const unitsOn = (block: string, floor: number) => units.filter((u) => u.block === block && u.floor === floor);

export const statusText: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const roomText: Record<RoomKind, string> = {
  living: "Living room",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  wc: "WC",
  hall: "Hall",
  balcony: "Balcony",
  storage: "Storage",
};

export const bedroomText = (n: number) => (n === 0 ? "Studio" : `${n} bedroom${n > 1 ? "s" : ""}`);

export const benefits = [
  "Up to 2 hectares of recreational space",
  "Guarded courtyard",
  "Underground and surface parking",
  "Retail and office premises",
  "Children's playgrounds",
  "Sports grounds",
  "Tennis courts",
  "Gym",
  "A lobby at the entrance to every building",
  "School",
];
