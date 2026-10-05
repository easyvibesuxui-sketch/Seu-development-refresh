/*
 * The SEU wireframe "S" as inline SVG so its layers can move independently.
 * On hover of any ancestor with `group` the lower layers drop by the offsets taken from
 * the brand's stretched variant (logo-wire-stretched.svg), so the mark stretches downward.
 */
export const LOGO_PATHS: { d: string; t: [number, number]; drop: number }[] = [
  { d: "M164.491,134.89l-18.667-6.2v-7.478l18.667,6.2Z", t: [769.508, -74.94], drop: 10.45 },
  { d: "M164.491,13.673l-18.667-6.2V0l18.667,6.2Z", t: [769.508, 20.5], drop: 0 },
  { d: "M0,135.243l32.9-6.549v-7.478L0,127.765Z", t: [882, -74.939], drop: 10.45 },
  { d: "M82.733,162.7l32.9-6.549v-7.477l-32.9,6.549Z", t: [818.365, -96.202], drop: 10.45 },
  { d: "M18.667,163.915,0,157.72v-7.478l18.667,6.2Z", t: [882, -97.415], drop: 10.45 },
  { d: "M115.635,74.812l-32.9-10.851V56.484l32.9,10.851Z", t: [818.365, -22.931], drop: 4.93 },
  { d: "M0,67.715l18.667-3.754V56.483L0,60.238Z", t: [882, -22.995], drop: 3.904 },
  { d: "M32.9,91.451,0,80.6V73.122L32.9,83.974Z", t: [882, -35.724], drop: 6.381 },
  { d: "M0,14.026,32.9,7.477V0L0,6.548Z", t: [882, 20.5], drop: 0 },
  { d: "M82.733,41.485l32.9-6.549V27.458l-32.9,6.549Z", t: [818.365, -0.763], drop: 0 },
  { d: "M18.667,42.7,0,36.5V29.025l18.667,6.2Z", t: [882, -1.977], drop: 0 },
  { d: "M145.825,115.809l18.667-3.754v-7.478l-18.667,3.754Z", t: [769.508, -60.03], drop: 7.228 },
];

export default function LogoMark({ className = "", color = "#18a874" }: { className?: string; color?: string }) {
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 53 58" fill="none" aria-hidden>
      <g transform="translate(-881.5 -19.807)" stroke={color} strokeWidth="1.1" strokeLinejoin="round">
        {LOGO_PATHS.map((p, i) => (
          <g key={i} className="logo-layer" style={{ ["--drop" as string]: `${p.drop}px` }}>
            <path d={p.d} transform={`translate(${p.t[0]} ${p.t[1]})`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
