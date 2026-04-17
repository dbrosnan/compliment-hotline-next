# Compliment Hotline — Design System

Canonical reference for the site's tokens, components, motion rules, and deployment. Keep this in sync with `packages/ui/src/styles/globals.css`.

## Stack

| | |
|---|---|
| Framework | **Next.js 16.1.6** (App Router, React 19.2.4) |
| Styling | **Tailwind v4.1.18** with `@theme inline` (no `tailwind.config.js`) |
| Component kit | **shadcn** style `radix-lyra`, registry-installed into `packages/ui` |
| UI primitives | **Radix UI** 1.4 |
| Icon library | Inline SVG (the shadcn-generated files used `@phosphor-icons/react` but its types collide with NodeNext moduleResolution — see "Known quirks") |
| Motion | **Framer Motion** via `motion/react` 12.38 + Magic UI (`border-beam`, `shimmer-button`) |
| Fonts | Google self-hosted via `next/font`: Monoton (display), Space Grotesk (sans), Fraunces w/ `opsz` axis (serif), JetBrains Mono (mono) |
| Speech | `SpeechSynthesisUtterance` via the `useSpeech` hook |
| Runtime | **Cloudflare Workers** via **@opennextjs/cloudflare** 1.19 (NOT Pages; NOT edge runtime exports) |
| Storage | D1 (`compliment-hotline`), R2 (`compliment-hotline-audio`), KV (`RATE_LIMIT`) |

## Tokens

All tokens live in [`packages/ui/src/styles/globals.css`](packages/ui/src/styles/globals.css). **Dark is the default theme** — festival art piece, lives at night.

### Brand palette (OKLCH, always available)

```css
--ch-midnight  oklch(0.17 0.08 290)   /* #0B0820 — page bg (dark) */
--ch-velvet    oklch(0.23 0.14 288)   /* #1A1040 — card surface */
--ch-chrome    oklch(0.31 0.17 290)   /* #2D1B5E — muted */
--ch-coral     oklch(0.72 0.21 22)    /* #FF5E6C — primary */
--ch-citrus    oklch(0.89 0.17 92)    /* #FFD23F — accent */
--ch-mint      oklch(0.89 0.15 162)   /* #6EF7C4 — positive accents */
--ch-magenta   oklch(0.70 0.28 338)   /* #E94BD6 — hot accent */
--ch-cream     oklch(0.93 0.04 82)    /* #FCE8C8 — foreground */
--ch-uv        oklch(0.45 0.27 291)   /* #7A2BFF — deep glow */
--ch-acid      oklch(0.92 0.23 130)   /* hazmat lime — flash */
--ch-hotpink   oklch(0.68 0.30 345)   /* bubblegum — peak moments */
--ch-cyan      oklch(0.85 0.18 210)   /* electric — link hover */
```

Usable as Tailwind utilities: `bg-midnight`, `text-coral`, `ring-citrus`, `border-mint`, …

### Semantic tokens (shadcn) — dark default

`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, plus `--chart-1..5` and `--sidebar-*`.

Light mode is kept as a toggle (`d` hotkey) for daytime accessibility, defined on `:root`; dark overrides live under `.dark`.

### Type scale (1.25 modular ratio)

```
text-xs   0.75rem   (12px)
text-sm   0.875rem  (14)
text-base 1rem      (16)   body default
text-lg   1.25rem   (20)
text-xl   1.5625rem (25)
text-2xl  1.953rem  (31)
text-3xl  2.441rem  (39)
text-4xl  3.052rem  (49)
text-5xl  3.815rem  (61)
text-6xl  4.768rem  (76)
text-7xl  5.96rem   (95)
```

### Spacing (4px base, t-shirt)

`--spacing-xs` (4), `sm` (8), `md` (16), `lg` (24), `xl` (32), `2xl` (48), `3xl` (72).

### Radius

`--radius: 0.75rem` base. Derived: `radius-sm` (60%), `md` (80%), `lg` (100%), `xl` (140%), `2xl` (180%), `3xl` (220%), `4xl` (260%).

### Shadows

| Token | Use |
|---|---|
| `shadow-xs` | Inline borders, subtle elevation |
| `shadow-sm` | Cards at rest |
| `shadow-md` | Cards on hover / dialogs |
| `shadow-neon` | Magenta + mint dual glow for psychedelic moments |
| `shadow-glow` | Coral bloom under the primary CTA |

## Component inventory

### Shared (`packages/ui/src/components/`)

| Component | Purpose | Notes |
|---|---|---|
| `button.tsx` | shadcn Button | Size + variant system |
| `card.tsx` | shadcn Card | `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| `dialog.tsx` | shadcn Dialog (Radix) | Used by PickUpModal; `XIcon` was replaced with inline SVG |
| `input.tsx` | shadcn Input | `rounded-lg` on CH surfaces |
| `label.tsx` | shadcn Label | Pair with Input via `htmlFor` |
| `sheet.tsx` | shadcn Sheet | Slide-in drawer (not yet used on page) |
| `skeleton.tsx` | shadcn Skeleton | Loading placeholders in marquee + counter |
| `sonner.tsx` | shadcn Sonner toast | Ready, not yet wired |
| `tabs.tsx` | shadcn Tabs | Submit section text/audio switch |
| `textarea.tsx` | shadcn Textarea | Compliment body input |
| `border-beam.tsx` | Magic UI border-beam | Hero pick-up button + modal card halo |
| `shimmer-button.tsx` | Magic UI shimmer button | Installed, not used (would break hero layout) |

### Page-level (`apps/web/components/`)

| Component | Purpose |
|---|---|
| `hero.tsx` | Wordmark, tagline, pick-up CTA, atmospheric layers |
| `pick-up-modal.tsx` | shadcn Dialog shell + LiquidLight + ComplimentText + TravelingWaveform |
| `liquid-light-backdrop.tsx` | 3 oil-blob SVG loops + feTurbulence + grain + phase wash |
| `compliment-text.tsx` | Kinetic Fraunces ink-bloom per word (wght + opsz axes) |
| `traveling-waveform.tsx` | 41-bar speech-reactive waveform |
| `use-speech.ts` (lib) | SpeechSynthesisUtterance reactive wrapper |
| `compliment-marquee.tsx` | Live ticker with skeleton loading + empty state |
| `how-it-works.tsx` | 4 step cards wrapped in `<Reveal>` |
| `counter.tsx` | Flip-digit compliment count with skeleton loading |
| `submit-section.tsx` | Text/audio Tabs form |
| `text-form.tsx` | Text compliment submission |
| `rotary-recorder.tsx` | Rotary-dial audio recorder w/ MediaRecorder |
| `footer.tsx` | Site footer with nav |
| `section-heading.tsx` | Shared marketing-section header pattern |
| `motion-primitives.tsx` | `<Reveal>` (scroll-into-view fade-up) + `<HoverLift>` |
| `phone-parade.tsx` | 6 floating + ringing rotary-phone SVGs |
| `disco-ball.tsx` | Rotating disco ball SVG |
| `sparkle-field.tsx` | Procedural sparkle field |
| `coiled-cord.tsx` | Gradient phone-cord section divider |
| `theme-provider.tsx` | `next-themes` wrapper, dark default, `d` hotkey |

## Motion rules

1. **Ease: `[0.22, 1, 0.36, 1]`** everywhere Framer Motion is used. No springs, no bounces.
2. **Durations**: 200-500 ms. Reveal fade-up = 400ms with 80ms × index stagger.
3. **Max 2 Magic UI effects per page.** Currently: BorderBeam on hero pick-up button + BorderBeam on pick-up modal card.
4. **Reduced motion**: every Framer Motion component runs through `useReducedMotion` and short-circuits to a plain `<div>` with the final styles. CSS animations respect the global safety net in `globals.css` (`@media (prefers-reduced-motion: reduce)`).
5. **Bespoke CSS animations** (liquid-light blobs, phone parade, handset ring, sparkle float, conic halo) are all gated by the global reduced-motion override.

## API surface

All routes run on Cloudflare Workers via OpenNext. No `export const runtime = "edge"` needed.

### Public

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/compliments/text` | Submit text compliment (honeypot, rate-limited, keyword-filtered) |
| POST | `/api/compliments/audio/init` | Reserve audio slot, return upload URL |
| PUT  | `/api/compliments/audio/upload?key=&id=` | Proxy upload to R2 |
| POST | `/api/compliments/audio/finalize` | Verify R2 object and mark ready |
| GET  | `/api/compliments/recent?cursor=` | Paginated feed (approved + seed) |
| GET  | `/api/compliments/stats` | `{ total }` — used by counter |
| GET  | `/api/compliments/[id]/audio` | Stream approved audio from R2 |

### Admin (cookie-gated via `ADMIN_TOKEN`)

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/api/admin/login` | Exchange token for httpOnly cookie |
| GET  | `/api/admin/queue` | Pending-only feed |
| GET  | `/api/admin/all?status=` | Every compliment, any status (used by /compliments UI) |
| POST | `/api/admin/approve` | Body `{id}` or `{ids:[]}` — bulk-capable |
| POST | `/api/admin/reject` | Mark rejected, move audio to `rejected/` R2 prefix |
| POST | `/api/admin/delete` | Hard delete row + R2 blob |
| GET  | `/api/admin/audio/[id]` | Admin-only preview stream |

### Admin pages

- `/compliments` — full moderation UI (filter, bulk approve/delete, CSV/JSON export, inline audio)
- `/admin.html` — legacy static shim carried over; can be deleted

## Cloudflare bindings

From `apps/web/wrangler.jsonc`:

```jsonc
{
  "d1_databases": [{ "binding": "DB", "database_name": "compliment-hotline", "database_id": "16191c2d-ec99-4065-b2f6-6785f6948bf0" }],
  "r2_buckets":   [{ "binding": "AUDIO", "bucket_name": "compliment-hotline-audio" }],
  "kv_namespaces":[{ "binding": "RATE_LIMIT", "id": "e1bedb8c7a864b8982d801e5d7ff7f60" }]
}
```

Secrets set via `wrangler secret put`: `ADMIN_TOKEN`, `IP_HASH_SALT_SEED`.

## Deployment

```bash
cd apps/web
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

The worker name is `compliment-hotline-next`. Custom domain cutover: move `complimenthotline.org` off the old Pages project (`compliment-hotline`) and attach it to the new Worker.

## How to add a new section

1. Use `<SectionHeading eyebrow="…" title="…" tagline="…" />` instead of hand-rolled heading markup. The tagline carries the `w-full max-w-xl` inline style already, sidestepping the Tailwind v4 bug.
2. Always pair `mx-auto max-w-*` with `w-full` on the container. (See "Known quirks".)
3. Wrap scroll-reveal content in `<Reveal index={i}>` — it honors reduced motion automatically.
4. Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border/50`) — never raw `bg-*-500` or hex.
5. Interactive elements need visible focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
6. Images get `alt`. Icon-only buttons get `aria-label`.

## Known quirks

1. **Tailwind v4 + shadcn Lyra: `mx-auto max-w-*` alone collapses the element to its narrowest unbreakable content.** Something in the cascade triggers intrinsic sizing. Fix: **always add `w-full`** alongside every `mx-auto max-w-*`. On text-heavy `<p>` elements that still collapse, use an inline style: `style={{ display:"block", width:"100%", maxWidth:"36rem", marginLeft:"auto", marginRight:"auto" }}`.
2. **`@phosphor-icons/react` barrel types conflict with NodeNext moduleResolution.** TypeScript can't resolve the re-exports through the package's `exports` field cleanly. Use inline SVGs for now; the shadcn-generated `dialog.tsx`, `sheet.tsx`, `sonner.tsx` have been patched to inline icons.
3. **OpenNext on Cloudflare runs Next.js on the Workers runtime directly.** Do NOT add `export const runtime = "edge"` to route handlers — it conflicts with OpenNext's bundling and causes "Cannot read properties of undefined (reading 'default')" at request time.
4. **`getCloudflareContext()` must be called with `{ async: true }`** when called outside of a pre-initialized request context. Use the `cfEnv()` helper in `lib/server/cf.ts`.
5. **SpeechSynthesis + user gestures**: Chrome drops `speak()` calls made in a `setTimeout` that spans more than a few hundred ms after the click. Call `.speak()` synchronously in the click handler; visual "ringing" phase is latency-only.
6. **Sparkles + `Math.random()`**: used in client-only `useMemo` so SSR hydration matches; don't move to server components.
