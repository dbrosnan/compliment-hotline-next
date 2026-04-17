"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
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

        <Card className="w-full bg-card/70 border-border/25 backdrop-blur-sm shadow-md">
          <CardContent className="w-full p-6 md:p-10">
            <RotaryRecorder />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
