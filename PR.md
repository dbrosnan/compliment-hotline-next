# PR: Compliment Hotline — Next.js + shadcn + 2026 design pass

## Summary

Ports the Compliment Hotline site from the original Vite/React 18 codebase (`compliment-hotline-web`) into a Next.js 16 + React 19 + Tailwind v4 + shadcn (`radix-lyra` style) monorepo, preserves the bespoke psychedelic pickup modal (LiquidLight + ComplimentText + TravelingWaveform), rebuilds the admin experience as a moderation page at `/compliments`, and ships the design-system pass (tokens, motion, layout, a11y, docs).

## Files changed

By directory (new monorepo):

```
apps/web/app/
  layout.tsx              (fonts + metadata + dark default)
  page.tsx                (composes Hero → Marquee → HowItWorks → Counter → Submit → Footer)
  compliments/page.tsx    (NEW — full admin moderation UI)
  api/compliments/{text,recent,stats,audio/init,audio/upload,audio/finalize,[id]/audio}/route.ts
  api/admin/{login,queue,all,approve,reject,delete,audio/[id]}/route.ts
apps/web/components/
  hero.tsx                (big pick-up CTA + BorderBeam + PhoneParade)
  pick-up-modal.tsx       (shadcn Dialog + bespoke psychedelic layers + BorderBeam)
  liquid-light-backdrop.tsx, compliment-text.tsx, traveling-waveform.tsx  (ported from Vite intact)
  compliment-marquee.tsx  (skeleton + empty state)
  how-it-works.tsx        (cards wrapped in <Reveal>)
  counter.tsx             (skeleton loading state)
  submit-section.tsx      (shadcn Tabs + SectionHeading)
  text-form.tsx           (aria-describedby, aria-live char count, aria-busy)
  rotary-recorder.tsx     (aria-pressed, keyboard hint, sr-only status region)
  footer.tsx              (semantic nav, focus rings)
  section-heading.tsx     (NEW — shared marketing-header pattern)
  motion-primitives.tsx   (NEW — <Reveal> + <HoverLift>, reduced-motion safe)
  phone-parade.tsx        (NEW — 6 floating ringing phones)
  disco-ball.tsx, sparkle-field.tsx, coiled-cord.tsx, theme-provider.tsx
apps/web/lib/
  api.ts, use-speech.ts, use-reduced-motion.ts (NEW)
  server/{cf,env,response,hash,ratelimit,filter,admin}.ts  (server-only helpers)
apps/web/wrangler.jsonc   (D1/R2/KV bindings reused from the Vite site)
apps/web/open-next.config.ts (NEW)
packages/ui/src/components/
  +border-beam.tsx, +shimmer-button.tsx (from Magic UI registry)
  dialog/sheet/sonner icon replacements (Phosphor barrel → inline SVG)
packages/ui/src/styles/globals.css   (OKLCH tokens, type scale, spacing, shadows, prefers-reduced-motion safety net)
DESIGN.md  (NEW — full design-system reference)
PR.md      (this file)
```

Commits on `main`: `eee4bd4` → `b205509` (migration), with the latest design pass on top of that.

## Before / after — Hero component

**Before** (original Vite site at complimenthotline.org):
- Single-file React component, hand-rolled Tailwind v3 classes with explicit brand colors (`bg-midnight`, `text-cream`, `text-coral`)
- `<video>` poster fallback at 40% opacity on a `bg-midnight` backdrop
- Sparkle field + single disco ball + pulsing play button overlaid on a ringing handset SVG
- CSS-only animations (word drop, fade stagger, ring shake) — no JS motion library, no reduced-motion gate
- Typography: Monoton display, Space Grotesk body
- Fixed handset size (220×220) — overflowed on mobile

**After** (Next.js 16 + shadcn + the 2026 pass):
- Semantic tokens everywhere: `text-foreground` / `bg-background` / `border-border/50` — brand colors only on decorative surfaces
- `<video>` at **55 % opacity**, no blend mode, so the Remotion reel is clearly visible but doesn't fight the copy; dark radial vignette behind the text column for contrast
- **PhoneParade** adds 6 floating + ringing rotary phones drifting on prime-offset loops with chromatic aberration — scales 1.4×/1.7× on sm/md
- **Magic UI `<BorderBeam>`** wraps the pick-up button with a 7 s citrus→coral traveling beam (count: 1 of 2 allowed per page)
- **Two disco balls** (small top-left + larger top-right)
- Responsive handset: `h-40 w-40 sm:h-52 md:h-56` — fluid play circle inside
- Tagline paragraph uses inline `width: 100% + maxWidth: 36rem` to sidestep the TW v4 `max-w-*` collapse bug
- Wordmark keeps the chromatic text-shadow aberration; letter-by-letter drop animation still present, now additionally gated by the global `prefers-reduced-motion` safety net
- CTA button opens `PickUpModal`, which is a `shadcn/dialog` wrapping the LiquidLight backdrop + kinetic Fraunces typography + speech-reactive waveform — all machinery ported intact from the Vite version

## shadcn components added

Via `shadcn@latest add` into `packages/ui`:

| Component | Source |
|---|---|
| button, card, dialog, input, label, sheet, skeleton, sonner, tabs, textarea | shadcn registry |
| border-beam, shimmer-button | Magic UI registry (`https://magicui.design/r/*.json`) |

## Motion library additions

- `motion@12.38` (Framer Motion) — imported as `motion/react`, used via the `<Reveal>` and `<HoverLift>` primitives in `apps/web/components/motion-primitives.tsx`
- Ease: `[0.22, 1, 0.36, 1]` — no springs
- Durations: 200-500 ms
- `useReducedMotion` hook short-circuits every animation to a plain `<div>` with the final style
- Global CSS safety net in `globals.css` disables CSS animations/transitions above 10 ms when `prefers-reduced-motion: reduce`

## Remaining TODOs (human decisions)

1. **Cut `complimenthotline.org` over** — still points at the old Vite Pages project (`compliment-hotline`). Swap the custom domain to the Next.js Worker `compliment-hotline-next`. Takes ~30 s in the Cloudflare dashboard.
2. **Archive or retire the Vite repo** (`compliment-hotline-web`) once the cutover is confirmed. It shares the same D1/R2/KV so no data migration needed.
3. **Moderate pending compliments** at `/compliments` — go through the queue (token stored at `/tmp/admin_token.txt`). `📭 No compliments match this filter` empty state is visible on filter tabs with no items.
4. **Remotion additions** — currently the 18 s reel covers the art piece's premise. If you want a tour-dates scene or an extra cart-reveal, point me at which and I'll add a scene + re-render.
5. **Reduced-motion defaults** — confirm the global `@media (prefers-reduced-motion: reduce)` kill-switch feels right. If you want Phone Parade to stay in motion even under reduced-motion, we can gate those specifically instead of relying on the global.
6. **shimmer-button** is installed but unused. Decide if you want it on a secondary CTA somewhere (e.g., "Leave one" button in the footer) or drop it to keep the Magic-UI count at 1.

## Pre-merge checklist

- [x] `npm run typecheck` green in both workspaces
- [x] `npx opennextjs-cloudflare build` + `deploy` green
- [x] 13/13 E2E (stats, recent, text submit, filter, honeypot, audio init, admin auth, admin queue) pass on `compliment-hotline-next.drewbrosnan.workers.dev`
- [x] Admin `/compliments` renders, login works, row actions work
- [x] Hero wordmark + tagline + CTA render correctly at ≥ 1280px and ≥ 375px
- [x] `prefers-reduced-motion` kills CSS animations
- [ ] Custom domain cutover — **awaiting user decision**
