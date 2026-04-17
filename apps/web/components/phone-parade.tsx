"use client";

/**
 * Decorative kinetic layer: floating + ringing rotary phones drift across
 * the hero, each on its own loop with chromatic aberration + rotation.
 * Purely ambient — pointer-events:none, aria-hidden, motion-reduce safe.
 */
export function PhoneParade() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PHONES.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `pp-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <div
            style={{
              animation: `pp-ring ${2 + (i % 3) * 0.3}s ease-in-out ${p.delay}s infinite`,
              transform: `rotate(${p.tilt}deg)`,
              filter: "drop-shadow(2px 0 0 oklch(0.70 0.28 338 / 0.5)) drop-shadow(-2px 0 0 oklch(0.89 0.15 162 / 0.5))",
            }}
          >
            <RotaryPhone />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pp-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-28px) translateX(14px); }
        }
        @keyframes pp-ring {
          0%, 86%, 100% { rotate: 0deg; }
          88% { rotate: -6deg; }
          91% { rotate: 6deg; }
          94% { rotate: -3deg; }
          97% { rotate: 2deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="pointer-events-none"] [style*="pp-float"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

const PHONES = [
  { x: 8, y: 14, size: 70, tilt: -14, opacity: 0.35, duration: 14, delay: 0 },
  { x: 88, y: 22, size: 56, tilt: 18, opacity: 0.28, duration: 16, delay: 2 },
  { x: 18, y: 70, size: 64, tilt: 22, opacity: 0.32, duration: 13, delay: 4 },
  { x: 78, y: 78, size: 52, tilt: -26, opacity: 0.26, duration: 15, delay: 1 },
  { x: 4, y: 46, size: 44, tilt: 12, opacity: 0.22, duration: 17, delay: 3 },
  { x: 92, y: 52, size: 48, tilt: -18, opacity: 0.24, duration: 12, delay: 5 },
];

function RotaryPhone() {
  return (
    <svg viewBox="0 0 160 130" width="100%" height="100%">
      <defs>
        <linearGradient id="ppBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.93 0.04 82)" />
          <stop offset="100%" stopColor="oklch(0.80 0.06 82)" />
        </linearGradient>
        <linearGradient id="ppDial" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.21 22)" />
          <stop offset="100%" stopColor="oklch(0.70 0.28 338)" />
        </linearGradient>
      </defs>
      {/* base */}
      <rect x="10" y="65" width="140" height="55" rx="10" fill="url(#ppBody)" stroke="oklch(0.17 0.08 290)" strokeWidth="2" />
      {/* dial */}
      <circle cx="80" cy="92" r="26" fill="url(#ppDial)" stroke="oklch(0.17 0.08 290)" strokeWidth="2" />
      <circle cx="80" cy="92" r="9" fill="oklch(0.17 0.08 290)" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={80 + Math.cos(a) * 17} cy={92 + Math.sin(a) * 17} r="2.5" fill="oklch(0.17 0.08 290)" />;
      })}
      {/* cradle hooks */}
      <rect x="18" y="58" width="20" height="8" rx="2" fill="oklch(0.17 0.08 290)" />
      <rect x="122" y="58" width="20" height="8" rx="2" fill="oklch(0.17 0.08 290)" />
      {/* receiver */}
      <path
        d="M10 40 C10 25, 32 18, 46 30 L115 30 C129 18, 150 25, 150 40 C150 55, 129 62, 115 50 L46 50 C32 62, 10 55, 10 40 Z"
        fill="url(#ppBody)"
        stroke="oklch(0.17 0.08 290)"
        strokeWidth="2"
      />
      <circle cx="24" cy="40" r="5" fill="oklch(0.17 0.08 290)" opacity="0.7" />
      <circle cx="136" cy="40" r="5" fill="oklch(0.17 0.08 290)" opacity="0.7" />
    </svg>
  );
}
