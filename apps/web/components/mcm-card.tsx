/**
 * MCMCard — Mid-Century Modern "flat" card with a double-stroke border,
 * hard-offset midnight shadow, and optional paper/hatch texture overlay.
 *
 * Shell structure:
 *   outer <div>  — 2px midnight border + hard offset shadow + variant fill
 *   padding      — 4px cream/butter "gap" that reads as a mat
 *   inner <div>  — 1px midnight border at 30% alpha, holds the content
 *
 * Textures are applied via the global `.noise-paper` / `.noise-hatch`
 * utilities defined in packages/ui/src/styles/globals.css.
 */

import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

type Variant = "citrus" | "mustard" | "cream";
type Tone = "noise" | "hatch" | "flat";

const VARIANT_FILL: Record<Variant, string> = {
  citrus: "bg-[var(--ch-citrus)]",
  mustard: "bg-[var(--ch-mustard)]",
  cream: "bg-[var(--ch-cream)]",
};

const GAP_FILL: Record<Variant, string> = {
  citrus: "bg-[var(--ch-cream)]",
  mustard: "bg-[var(--ch-butter)]",
  cream: "bg-[var(--ch-butter)]",
};

const TONE_CLASS: Record<Tone, string> = {
  noise: "noise-paper",
  hatch: "noise-hatch",
  flat: "",
};

export interface MCMCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  tone?: Tone;
}

const MCMCard = React.forwardRef<HTMLDivElement, MCMCardProps>(function MCMCard(
  { className, variant = "citrus", tone = "noise", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-mcm-card
      className={cn(
        "relative inline-block",
        "border-[2px] border-[var(--ch-midnight)]",
        "p-1",
        GAP_FILL[variant],
        "transition-[box-shadow,transform] duration-150 ease-out",
        "hover:-translate-x-[2px] hover:-translate-y-[2px]",
        "[box-shadow:var(--shadow-ink)]",
        "hover:[box-shadow:6px_6px_0_oklch(0.17_0.08_290)]",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "relative",
          "border border-[oklch(0.17_0.08_290/30%)]",
          VARIANT_FILL[variant],
          TONE_CLASS[tone],
        )}
      >
        {children}
      </div>
    </div>
  );
});

export interface MCMCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const MCMCardContent = React.forwardRef<HTMLDivElement, MCMCardContentProps>(
  function MCMCardContent({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("relative z-[1] p-6 text-[var(--foreground)]", className)}
        {...rest}
      />
    );
  },
);

export { MCMCard, MCMCardContent };
