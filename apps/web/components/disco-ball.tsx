export function DiscoBall() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_8s_linear_infinite]">
      <defs>
        <radialGradient id="dbGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.93 0.04 82)" />
          <stop offset="40%" stopColor="oklch(0.70 0.28 338)" />
          <stop offset="100%" stopColor="oklch(0.31 0.17 290)" />
        </radialGradient>
        <pattern id="dbFacets" patternUnits="userSpaceOnUse" width="10" height="10">
          <rect width="10" height="10" fill="url(#dbGrad)" />
          <path d="M0 0 L10 10 M10 0 L0 10" stroke="oklch(0.17 0.08 290)" strokeWidth="0.6" opacity="0.5" />
        </pattern>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#dbFacets)" stroke="oklch(0.93 0.04 82)" strokeWidth="1" opacity="0.95" />
      <circle cx="38" cy="36" r="8" fill="oklch(0.93 0.04 82)" opacity="0.35" />
      <line x1="50" y1="8" x2="50" y2="0" stroke="oklch(0.93 0.04 82)" strokeWidth="1.5" />
    </svg>
  );
}
