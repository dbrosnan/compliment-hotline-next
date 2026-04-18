/**
 * Paper-cutout MCM disco ball: cream base, midnight-outlined tiles, with
 * a single coral accent tile. Sits as a flat decoration on butter yellow.
 */
export function DiscoBall() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_8s_linear_infinite]">
      <defs>
        <pattern id="dbFacets" patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill="oklch(0.93 0.04 82)" />
          <path
            d="M0 0 L10 10 M10 0 L0 10"
            stroke="oklch(0.17 0.08 290)"
            strokeWidth="0.8"
            opacity="0.7"
          />
        </pattern>
      </defs>
      {/* Base ball — cream with midnight tile grid */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="url(#dbFacets)"
        stroke="oklch(0.17 0.08 290)"
        strokeWidth="1.2"
      />
      {/* Single coral accent tile (the "disco" wink) */}
      <rect
        x="56"
        y="38"
        width="10"
        height="10"
        fill="oklch(0.72 0.21 22)"
        stroke="oklch(0.17 0.08 290)"
        strokeWidth="0.8"
      />
      {/* Cream highlight blob */}
      <circle cx="38" cy="36" r="6" fill="oklch(0.93 0.04 82)" opacity="0.55" />
      {/* Hanging line */}
      <line x1="50" y1="8" x2="50" y2="0" stroke="oklch(0.17 0.08 290)" strokeWidth="1.5" />
    </svg>
  );
}
