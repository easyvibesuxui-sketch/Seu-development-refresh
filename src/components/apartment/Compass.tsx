/** North arrow for apartment layouts. */
export default function Compass({ label = "North arrow", className = "absolute right-5 top-4 z-10" }: { label?: string; className?: string }) {
  return (
    <div className={`compass text-seu-ink ${className}`} role="img" aria-label={label}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="15" stroke="currentColor" strokeOpacity=".4" />
        <path d="M28 16l4 12-4 12-4-12z" fill="#8b5a3c" />
        <path d="M28 28l4 0-4 12z" fill="#15201d" fillOpacity=".5" />
        {[
          ["N", 28, 7],
          ["S", 28, 54],
          ["W", 4, 31],
          ["E", 52, 31],
        ].map(([l, x, y]) => (
          <text key={l as string} x={x as number} y={y as number} fontSize="8" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
