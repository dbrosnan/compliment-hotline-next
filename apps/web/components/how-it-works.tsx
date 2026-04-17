import { Card, CardContent } from "@workspace/ui/components/card";
import { Reveal } from "./motion-primitives";
import { SectionHeading } from "./section-heading";
import { VerticalVideo } from "./vertical-video";

const STEPS = [
  {
    n: "01",
    title: "Find the cart",
    body: "Look for the wooden cart rolling around the festival, draped in phone cords and disco light. Eight landline phones, all real, all ringing.",
    accent: "text-coral",
  },
  {
    n: "02",
    title: "Pick up",
    body: "Grab the receiver. A stranger's compliment plays — something someone said out loud because they meant it.",
    accent: "text-citrus",
  },
  {
    n: "03",
    title: "Record yours",
    body: "After the beep, leave a compliment for whoever picks up next. 30 seconds. Be kind. Be specific.",
    accent: "text-mint",
  },
  {
    n: "04",
    title: "Or leave one here",
    body: "Can't make it to the cart? Drop a text or audio compliment below. We'll pipe it into the rotation.",
    accent: "text-magenta",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading eyebrow="The whole bit" title="HOW IT WORKS" className="mb-16" />

        {/* Two-column: video left, steps stacked right. Stacks vertically
            on <lg (video on top, steps below). */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Left — iPhone-aspect tour video. Drop the encoded file at
              apps/web/public/cart-tour.mp4 (+ cart-tour-poster.jpg).
              See vertical-video.tsx for the ffmpeg encoding command. */}
          <div className="lg:sticky lg:top-24">
            <VerticalVideo
              src="/cart-tour.mp4"
              poster="/cart-tour-poster.jpg"
              label="Compliment Hotline cart in action"
              className="max-w-xs sm:max-w-sm"
            />
          </div>

          {/* Right — the four steps stacked vertically */}
          <div className="flex flex-col gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} index={i}>
                <Card className="group relative overflow-hidden bg-card/60 border-border/30 p-0">
                  <CardContent className="p-6">
                    <div className={`font-display text-5xl ${s.accent} mb-4`}>{s.n}</div>
                    <h3 className="text-2xl font-semibold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                  </CardContent>
                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-coral/10 blur-2xl transition-colors duration-500 group-hover:bg-coral/30" />
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
