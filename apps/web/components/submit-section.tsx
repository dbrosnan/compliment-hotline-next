"use client";

import { MCMCard, MCMCardContent } from "@/components/mcm-card";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { SectionHeading } from "./section-heading";
import { RotaryRecorder } from "./rotary-recorder";

export function SubmitSection() {
  return (
    <section id="submit" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="Your turn"
          title="LEAVE ONE"
          tagline="30 seconds of voice. Be kind. Be specific. Gets queued, reviewed by a human, then plays on a real landline at the next festival."
          className="mb-10"
        />

        <MCMCard variant="citrus" tone="noise" className="relative w-full overflow-hidden">
          {/* Two counter-rotating comet beams for a "shooting star around
              the card" effect — citrus→coral + magenta→citrus, the MCM
              neon accent we agreed stays. */}
          <BorderBeam
            size={220}
            duration={9}
            colorFrom="oklch(0.89 0.17 92 / 0.95)"
            colorTo="oklch(0.72 0.21 22 / 0.95)"
            borderWidth={1.5}
          />
          <BorderBeam
            size={180}
            duration={13}
            delay={4}
            reverse
            colorFrom="oklch(0.70 0.28 338 / 0.85)"
            colorTo="oklch(0.89 0.17 92 / 0.85)"
            borderWidth={1.2}
          />
          <MCMCardContent className="w-full p-6 md:p-10">
            <RotaryRecorder />
          </MCMCardContent>
        </MCMCard>
      </div>
    </section>
  );
}
