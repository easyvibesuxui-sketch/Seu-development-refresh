"use client";

import { roomIn, type RoomKind, type Unit } from "@/data/inventory";
import { useLang } from "@/lib/useLang";

/*
 * Architectural plan of an apartment: one layout per bedroom count (studio, 1, 2, 3), scaled
 * to the unit's floor area. Rooms are outlined with thick walls, openings are cut out of them,
 * then doors, windows and a light layer of furniture. Room labels carry the unit's own room
 * areas (the list beside the viewer); `dims` adds the dimension chains along the top and the
 * left, the overall sizes and each room's width × length.
 */

type Pt = [number, number];
type Rect = [x: number, y: number, w: number, h: number];
type PlanRoom = {
  kind: RoomKind;
  /** Bedroom number when there are several. */
  n?: number;
  pts: Pt[];
  /** The room's main rectangle: furniture, label and width × length go here. */
  main: Rect;
};
// An opening in a wall: along x (a horizontal wall at y = at) or along y (a vertical wall at x = at).
type Opening = { kind: "door" | "window" | "slide" | "open"; axis: "x" | "y"; at: number; from: number; to: number; into?: 1 | -1; hinge?: "start" | "end" };
type Layout = { rooms: PlanRoom[]; balcony: Pt[]; openings: Opening[] };

const rect = ([x, y, w, h]: Rect): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const room = (kind: RoomKind, r: Rect, n?: number): PlanRoom => ({ kind, n, pts: rect(r), main: r });

const LAYOUTS: Record<number, Layout> = {
  0: {
    rooms: [
      room("hall", [0, 0, 2.2, 2.6]),
      room("bathroom", [0, 2.6, 2.2, 2.2]),
      room("kitchen", [2.2, 0, 4.4, 2.3]),
      { kind: "living", pts: [[2.2, 2.3], [6.6, 2.3], [6.6, 6.6], [0, 6.6], [0, 4.8], [2.2, 4.8]], main: [2.2, 2.3, 4.4, 4.3] },
    ],
    balcony: rect([2.2, 6.6, 4.4, 1.3]),
    openings: [
      { kind: "door", axis: "x", at: 0, from: 0.6, to: 1.5, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 2.6, from: 0.5, to: 1.2, into: 1, hinge: "start" },
      { kind: "open", axis: "y", at: 2.2, from: 0.9, to: 2.5 },
      { kind: "open", axis: "x", at: 2.3, from: 2.3, to: 6.5 },
      { kind: "window", axis: "x", at: 0, from: 3.6, to: 5.6 },
      { kind: "window", axis: "y", at: 6.6, from: 3.4, to: 5.6 },
      { kind: "window", axis: "x", at: 6.6, from: 0.4, to: 1.8 },
      { kind: "slide", axis: "x", at: 6.6, from: 2.8, to: 5.2 },
    ],
  },
  1: {
    rooms: [
      room("hall", [0, 0, 2.2, 2.6]),
      room("bathroom", [0, 2.6, 2.2, 2.0]),
      room("kitchen", [2.2, 0, 5.4, 2.3]),
      { kind: "living", pts: [[2.2, 2.3], [7.6, 2.3], [7.6, 7.4], [4.0, 7.4], [4.0, 4.6], [2.2, 4.6]], main: [4.0, 2.3, 3.6, 5.1] },
      room("bedroom", [0, 4.6, 4.0, 2.8]),
    ],
    balcony: rect([4.0, 7.4, 3.6, 1.3]),
    openings: [
      { kind: "door", axis: "x", at: 0, from: 0.6, to: 1.5, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 2.6, from: 0.5, to: 1.2, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 4.6, from: 2.4, to: 3.2, into: 1, hinge: "end" },
      { kind: "open", axis: "y", at: 2.2, from: 0.9, to: 2.5 },
      { kind: "open", axis: "x", at: 2.3, from: 2.3, to: 7.5 },
      { kind: "window", axis: "x", at: 0, from: 3.4, to: 6.4 },
      { kind: "window", axis: "x", at: 7.4, from: 0.6, to: 3.2 },
      { kind: "window", axis: "y", at: 7.6, from: 3.0, to: 4.6 },
      { kind: "slide", axis: "x", at: 7.4, from: 4.6, to: 7.0 },
    ],
  },
  2: {
    rooms: [
      room("kitchen", [0, 0, 4.5, 2.0]),
      { kind: "living", pts: [[0, 2.0], [4.5, 2.0], [4.5, 0], [6.4, 0], [6.4, 2.2], [8.9, 2.2], [8.9, 3.3], [4.5, 3.3], [4.5, 6.4], [0, 6.4]], main: [0, 2.0, 4.5, 4.4] },
      room("hall", [6.4, 0, 2.5, 2.2]),
      room("wc", [8.9, 0, 2.0, 1.2]),
      room("bathroom", [8.9, 1.2, 2.0, 2.1]),
      room("bedroom", [4.5, 3.3, 3.2, 3.8], 1),
      room("bedroom", [7.7, 3.3, 3.2, 3.8], 2),
    ],
    balcony: [[0, 6.4], [4.5, 6.4], [4.5, 7.1], [10.9, 7.1], [10.9, 8.4], [0, 8.4]],
    openings: [
      { kind: "door", axis: "x", at: 0, from: 7.1, to: 8.0, into: 1, hinge: "end" },
      { kind: "open", axis: "x", at: 2.0, from: 0.1, to: 4.4 },
      { kind: "door", axis: "y", at: 8.9, from: 0.2, to: 0.9, into: 1, hinge: "start" },
      { kind: "door", axis: "y", at: 8.9, from: 2.4, to: 3.1, into: 1, hinge: "end" },
      { kind: "door", axis: "x", at: 3.3, from: 4.7, to: 5.5, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 3.3, from: 7.95, to: 8.75, into: 1, hinge: "end" },
      { kind: "window", axis: "x", at: 0, from: 1.0, to: 3.4 },
      { kind: "window", axis: "y", at: 0, from: 2.6, to: 5.6 },
      { kind: "window", axis: "y", at: 10.9, from: 4.3, to: 6.2 },
      { kind: "slide", axis: "x", at: 6.4, from: 0.9, to: 3.7 },
      { kind: "slide", axis: "x", at: 7.1, from: 5.1, to: 7.1 },
      { kind: "slide", axis: "x", at: 7.1, from: 8.5, to: 10.3 },
    ],
  },
  3: {
    rooms: [
      room("kitchen", [0, 0, 4.5, 2.0]),
      { kind: "living", pts: [[0, 2.0], [4.5, 2.0], [4.5, 0], [6.4, 0], [6.4, 2.2], [11.1, 2.2], [11.1, 3.3], [4.5, 3.3], [4.5, 6.4], [0, 6.4]], main: [0, 2.0, 4.5, 4.4] },
      room("hall", [6.4, 0, 2.5, 2.2]),
      room("storage", [8.9, 0, 1.0, 2.2]),
      room("wc", [9.9, 0, 1.2, 2.2]),
      room("bathroom", [11.1, 0, 2.0, 3.3]),
      room("bedroom", [4.5, 3.3, 2.9, 3.8], 1),
      room("bedroom", [7.4, 3.3, 2.8, 3.8], 2),
      room("bedroom", [10.2, 3.3, 2.9, 3.8], 3),
    ],
    balcony: [[0, 6.4], [4.5, 6.4], [4.5, 7.1], [13.1, 7.1], [13.1, 8.4], [0, 8.4]],
    openings: [
      { kind: "door", axis: "x", at: 0, from: 7.1, to: 8.0, into: 1, hinge: "end" },
      { kind: "open", axis: "x", at: 2.0, from: 0.1, to: 4.4 },
      { kind: "door", axis: "x", at: 2.2, from: 9.0, to: 9.8, into: -1, hinge: "start" },
      { kind: "door", axis: "x", at: 2.2, from: 10.1, to: 10.9, into: -1, hinge: "end" },
      { kind: "door", axis: "y", at: 11.1, from: 2.4, to: 3.1, into: 1, hinge: "end" },
      { kind: "door", axis: "x", at: 3.3, from: 4.7, to: 5.5, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 3.3, from: 7.6, to: 8.4, into: 1, hinge: "start" },
      { kind: "door", axis: "x", at: 3.3, from: 10.3, to: 11.0, into: 1, hinge: "start" },
      { kind: "window", axis: "x", at: 0, from: 1.0, to: 3.4 },
      { kind: "window", axis: "y", at: 0, from: 2.6, to: 5.6 },
      { kind: "window", axis: "y", at: 13.1, from: 4.3, to: 6.2 },
      { kind: "slide", axis: "x", at: 6.4, from: 0.9, to: 3.7 },
      { kind: "slide", axis: "x", at: 7.1, from: 4.9, to: 6.9 },
      { kind: "slide", axis: "x", at: 7.1, from: 7.8, to: 9.8 },
      { kind: "slide", axis: "x", at: 7.1, from: 10.7, to: 12.6 },
    ],
  },
};

const WALL = 20; // units, 100 to the metre
const INK = "#111923";
const LINE = "rgb(17 25 35 / 0.42)";
const DIM = "#a8541f";
const PAPER = "#fffdf8";

const polyArea = (pts: Pt[]) => Math.abs(pts.reduce((s, [x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; return s + x * ny - nx * y; }, 0)) / 2;

export default function ApartmentPlan({ unit, dims, alt }: { unit: Unit; dims: boolean; alt: string }) {
  const lang = useLang();
  const layout = LAYOUTS[Math.min(unit.bedrooms, 3)];
  // One scale for the whole layout so its rooms add up to the unit's floor area.
  const inside = layout.rooms.reduce((s, r) => s + polyArea(r.pts), 0);
  const target = unit.totalArea - (unit.rooms.find((r) => r.kind === "balcony")?.area ?? 0);
  const k = Math.sqrt(target / inside);
  const u = (m: number) => Math.round(m * k * 100);
  const path = (pts: Pt[]) => `M${pts.map(([x, y]) => `${u(x)},${u(y)}`).join("L")}Z`;
  const m2 = lang === "ka" ? "მ²" : "m²";
  const metres = (m: number) => (m * k).toFixed(2);

  // The unit's own areas, taken in order for repeated rooms (bedroom 1, 2, 3).
  const areaOf = (r: PlanRoom) => {
    const same = unit.rooms.filter((x) => x.kind === r.kind);
    return (same[(r.n ?? 1) - 1] ?? same[0])?.area ?? +(polyArea(r.pts) * k * k).toFixed(1);
  };

  const all = [...layout.rooms.flatMap((r) => r.pts), ...layout.balcony];
  const W = Math.max(...all.map((p) => p[0]));
  const H = Math.max(...all.map((p) => p[1]));
  // Text keeps one size on screen whatever the apartment's size.
  const fs = u(Math.max(W, H)) / 42;
  const pad = fs * 4.6;
  const view = `${-pad} ${-pad} ${u(W) + pad + fs * 1.6} ${u(H) + pad + fs * 1.6}`;

  // Dimension chains: every wall corner on the top edge and on the left edge.
  const marks = (v: number[]) => [...new Set(v.map((m) => Math.round(m * 100) / 100))].sort((a, b) => a - b);
  const topMarks = marks(layout.rooms.flatMap((r) => r.pts).filter((p) => p[1] === 0).map((p) => p[0]));
  const leftMarks = marks([...layout.rooms.flatMap((r) => r.pts), ...layout.balcony].filter((p) => p[0] === 0).map((p) => p[1]));

  return (
    <svg viewBox={view} className="h-full w-full" role="img" aria-label={alt}>
      {/* Balcony: a deck behind a thin rail. */}
      <clipPath id={`deck-${unit.id}`}>
        <path d={path(layout.balcony)} />
      </clipPath>
      <path d={path(layout.balcony)} fill="#efe7da" />
      <g clipPath={`url(#deck-${unit.id})`} stroke={LINE} strokeOpacity=".4" strokeWidth="1.5">
        {Array.from({ length: Math.ceil(W / 0.45) }, (_, i) => (
          <line key={i} x1={u(i * 0.45)} x2={u(i * 0.45)} y1="0" y2={u(H)} />
        ))}
      </g>
      <path d={path(layout.balcony)} fill="none" stroke={INK} strokeWidth="5" />

      {/* Rooms and walls. */}
      {layout.rooms.map((r, i) => (
        <path key={i} d={path(r.pts)} fill={PAPER} stroke={INK} strokeWidth={WALL} strokeLinejoin="miter" />
      ))}

      {/* Openings cut out of the walls, then what fills them. */}
      {layout.openings.map((o, i) => {
        const a = u(o.from);
        const b = u(o.to);
        const c = u(o.at);
        const half = WALL / 2 + 1;
        const r = o.axis === "x" ? { x: a, y: c - half, width: b - a, height: half * 2 } : { x: c - half, y: a, width: half * 2, height: b - a };
        return <rect key={i} {...r} fill={o.kind === "door" || o.kind === "open" ? PAPER : "#f6f0e5"} />;
      })}
      {layout.openings.map((o, i) => (
        <OpeningMark key={i} o={o} u={u} />
      ))}

      {layout.rooms.map((r, i) => (
        <Furniture key={i} room={r} u={u} />
      ))}

      {/* Room names and areas. */}
      {[...layout.rooms, { kind: "balcony" as RoomKind, pts: layout.balcony, main: balconyMain(layout.balcony) }].map((r, i) => {
        const [x, y, w, h] = r.main;
        // Clear of the bed: below it in a deep bedroom, beside it in a wide one.
        const wide = r.kind === "bedroom" && w > h;
        const cx = wide ? u(x + 2.3 + (w - 2.3) / 2) : u(x + w / 2);
        const drop: Partial<Record<RoomKind, number>> = { living: 0.3, kitchen: 0.14, hall: 0.12 };
        const cy = u(y + h / 2) + (r.kind === "bedroom" && !wide ? u(h * 0.22) : u(h * (drop[r.kind] ?? 0)));
        const small = w * k < 1.6 || h * k < 1.3;
        // Narrow rooms take a short name so it stays inside their walls.
        const short: Partial<Record<RoomKind, [string, string]>> = { wc: ["WC", "WC"], storage: ["Store", "საკუჭ."] };
        const label = small && short[r.kind] ? short[r.kind]![lang === "ka" ? 1 : 0] : roomIn(r.kind, lang);
        const name = "n" in r && r.n && unit.bedrooms > 1 ? `${label} ${r.n}` : label;
        return (
          <g key={i} textAnchor="middle" fill={INK}>
            <text x={cx} y={cy - fs * 0.5} fontSize={fs * (small ? 0.8 : 0.95)} fontWeight="600" letterSpacing={fs * 0.1} fillOpacity=".6" style={{ textTransform: "uppercase" }}>
              {name}
            </text>
            <text x={cx} y={cy + fs * 1.05} fontSize={fs * (small ? 1.15 : 1.5)} fontFamily="var(--font-display)">
              {"pts" in r && r.kind !== "balcony" ? areaOf(r as PlanRoom) : (unit.rooms.find((x) => x.kind === "balcony")?.area ?? +(polyArea(layout.balcony) * k * k).toFixed(1))} {m2}
            </text>
            {dims && r.kind !== "balcony" && !small && (
              <text x={cx} y={cy + fs * 2.3} fontSize={fs * 0.85} fill={DIM}>
                {metres(w)} × {metres(h)}
              </text>
            )}
          </g>
        );
      })}

      {dims && (
        <g stroke={DIM} fill={DIM} fontSize={fs * 0.85} textAnchor="middle">
          <Chain marks={topMarks} at={-fs * 1.6} axis="x" u={u} k={k} fs={fs} />
          <Chain marks={[0, W]} at={-fs * 3.4} axis="x" u={u} k={k} fs={fs} />
          <Chain marks={leftMarks} at={-fs * 1.6} axis="y" u={u} k={k} fs={fs} />
          <Chain marks={[0, H]} at={-fs * 3.4} axis="y" u={u} k={k} fs={fs} />
        </g>
      )}
    </svg>
  );
}

/** The balcony's widest rectangle, for its label. */
function balconyMain(pts: Pt[]): Rect {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const bottom = Math.max(...ys);
  const top = [...ys].sort((a, b) => b - a).find((y) => y < bottom) ?? Math.min(...ys);
  return [Math.min(...xs), top, Math.max(...xs) - Math.min(...xs), bottom - top];
}

function OpeningMark({ o, u }: { o: Opening; u: (m: number) => number }) {
  const a = u(o.from);
  const b = u(o.to);
  const c = u(o.at);
  const half = WALL / 2;
  const line = (p: number, q: number, d: number, w = 2.5, key?: string | number) =>
    o.axis === "x" ? <line key={key} x1={p} x2={q} y1={c + d} y2={c + d} strokeWidth={w} /> : <line key={key} y1={p} y2={q} x1={c + d} x2={c + d} strokeWidth={w} />;
  const jamb = (p: number, key: string) => (o.axis === "x" ? <line key={key} x1={p} x2={p} y1={c - half} y2={c + half} strokeWidth="2.5" /> : <line key={key} y1={p} y2={p} x1={c - half} x2={c + half} strokeWidth="2.5" />);

  if (o.kind === "open") {
    return <g stroke={LINE} strokeDasharray="8 8">{line(a, b, 0, 2)}</g>;
  }
  if (o.kind === "window") {
    return (
      <g stroke={INK}>
        {[-half, 0, half].map((d) => line(a, b, d, 2.5, d))}
        {jamb(a, "a")}
        {jamb(b, "b")}
      </g>
    );
  }
  if (o.kind === "slide") {
    const mid = (a + b) / 2;
    return (
      <g stroke={INK}>
        {line(a, mid + 20, -5, 5)}
        {line(mid - 20, b, 5, 5)}
        {jamb(a, "a")}
        {jamb(b, "b")}
      </g>
    );
  }
  // Door: the leaf opened 90° into the room from its hinge, and its swing.
  const len = b - a;
  const s = o.into ?? 1;
  const hinge = o.hinge === "end" ? b : a;
  const tip = o.hinge === "end" ? a : b;
  const face = c + s * half;
  const end = face + s * len;
  const sweep = (o.hinge === "end") === (s === 1) ? (o.axis === "x" ? 0 : 1) : o.axis === "x" ? 1 : 0;
  return o.axis === "x" ? (
    <g stroke={INK} fill="none">
      <line x1={hinge} y1={face} x2={hinge} y2={end} strokeWidth="5" />
      <path d={`M${tip},${face}A${len},${len} 0 0 ${sweep} ${hinge},${end}`} strokeWidth="2" strokeOpacity=".5" />
    </g>
  ) : (
    <g stroke={INK} fill="none">
      <line y1={hinge} x1={face} y2={hinge} x2={end} strokeWidth="5" />
      <path d={`M${face},${tip}A${len},${len} 0 0 ${sweep} ${end},${hinge}`} strokeWidth="2" strokeOpacity=".5" />
    </g>
  );
}

/** A light layer of furniture, placed in each room's main rectangle by its kind. */
function Furniture({ room: r, u }: { room: PlanRoom; u: (m: number) => number }) {
  const [x, y, w, h] = r.main;
  const R = (rx: number, ry: number, rw: number, rh: number, extra: { rx?: number; dash?: boolean } = {}) => (
    <rect x={u(rx)} y={u(ry)} width={u(rw)} height={u(rh)} rx={extra.rx} strokeDasharray={extra.dash ? "6 6" : undefined} />
  );
  let items: React.ReactNode = null;
  switch (r.kind) {
    case "kitchen":
      items = (
        <>
          {R(x + 0.1, y + 0.1, Math.min(w - 0.2, 3.6), 0.62)}
          <circle cx={u(x + 0.7)} cy={u(y + 0.41)} r={u(0.12)} />
          <circle cx={u(x + 1.0)} cy={u(y + 0.41)} r={u(0.12)} />
          {R(x + 1.9, y + 0.2, 0.6, 0.42, { rx: 8 })}
        </>
      );
      break;
    case "living":
      items = (
        <>
          {R(x + 0.2, y + h * 0.36 - 1.0, 0.85, 2.0, { rx: 10 })}
          {R(x + 1.35, y + h * 0.36 - 0.85, 1.7, 1.7, { dash: true })}
          {R(x + 1.85, y + h * 0.36 - 0.27, 0.7, 0.55)}
        </>
      );
      break;
    case "bedroom": {
      const bw = r.n && r.n > 1 ? 1.0 : 1.6;
      // In a wide, shallow room the bed stands against the side wall.
      if (w > h) {
        const by = y + h / 2 - bw / 2;
        items = (
          <>
            {R(x + 0.2, by, 2.0, bw)}
            {R(x + 0.3, by + 0.1, 0.35, bw / 2 - 0.15, { rx: 6 })}
            {R(x + 0.3, by + bw / 2 + 0.05, 0.35, bw / 2 - 0.15, { rx: 6 })}
          </>
        );
        break;
      }
      const bx = x + w / 2 - bw / 2;
      items = (
        <>
          {R(bx, y + 0.35, bw, 2.0)}
          {bw > 1.2 ? (
            <>
              {R(bx + 0.1, y + 0.45, bw / 2 - 0.15, 0.35, { rx: 6 })}
              {R(bx + bw / 2 + 0.05, y + 0.45, bw / 2 - 0.15, 0.35, { rx: 6 })}
            </>
          ) : (
            R(bx + 0.12, y + 0.45, bw - 0.24, 0.35, { rx: 6 })
          )}
        </>
      );
      break;
    }
    case "bathroom":
      items = (
        <>
          {R(x + w - 1.05, y + 0.1, 0.95, 0.95)}
          <line x1={u(x + w - 1.05)} y1={u(y + 0.1)} x2={u(x + w - 0.1)} y2={u(y + 1.05)} />
          <ellipse cx={u(x + 0.45)} cy={u(y + 0.45)} rx={u(0.2)} ry={u(0.28)} />
          {h > 1.8 && R(x + w - 0.55, y + h - 0.8, 0.45, 0.6, { rx: 10 })}
        </>
      );
      break;
    case "wc":
      items = <ellipse cx={u(x + w / 2)} cy={u(y + 0.42)} rx={u(0.2)} ry={u(0.28)} />;
      break;
    case "hall":
      items = R(x + w - 0.7, y + 0.15, 0.55, Math.min(1.6, h - 0.3));
      break;
    case "storage":
      items = [0.3, 0.6, 0.9].map((d) => <line key={d} x1={u(x + 0.12)} x2={u(x + w - 0.12)} y1={u(y + d)} y2={u(y + d)} />);
      break;
  }
  return (
    <g fill="none" stroke={LINE} strokeWidth="2.5">
      {items}
    </g>
  );
}

/** One chain of dimensions: ticks at each mark and the span written over each segment. */
function Chain({ marks, at, axis, u, k, fs }: { marks: number[]; at: number; axis: "x" | "y"; u: (m: number) => number; k: number; fs: number }) {
  const t = fs * 0.45;
  return (
    <g>
      {axis === "x" ? <line x1={u(marks[0])} x2={u(marks[marks.length - 1])} y1={at} y2={at} strokeWidth="1.5" /> : <line y1={u(marks[0])} y2={u(marks[marks.length - 1])} x1={at} x2={at} strokeWidth="1.5" />}
      {marks.map((m) => {
        const p = u(m);
        return axis === "x" ? (
          <g key={m}>
            <line x1={p} x2={p} y1={at - t} y2={at + t} strokeWidth="1.5" />
            <line x1={p - t * 0.6} x2={p + t * 0.6} y1={at + t * 0.6} y2={at - t * 0.6} strokeWidth="2.5" />
          </g>
        ) : (
          <g key={m}>
            <line y1={p} y2={p} x1={at - t} x2={at + t} strokeWidth="1.5" />
            <line y1={p - t * 0.6} y2={p + t * 0.6} x1={at + t * 0.6} x2={at - t * 0.6} strokeWidth="2.5" />
          </g>
        );
      })}
      {marks.slice(1).map((m, i) => {
        const mid = u((m + marks[i]) / 2);
        const label = ((m - marks[i]) * k).toFixed(2);
        return axis === "x" ? (
          <text key={m} x={mid} y={at - fs * 0.4} stroke="none">
            {label}
          </text>
        ) : (
          <text key={m} x={at - fs * 0.4} y={mid} stroke="none" transform={`rotate(-90 ${at - fs * 0.4} ${mid})`}>
            {label}
          </text>
        );
      })}
    </g>
  );
}
