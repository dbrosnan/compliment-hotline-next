import { Hero } from "@/components/hero";
import { ComplimentMarquee } from "@/components/compliment-marquee";
import { CoiledCord } from "@/components/coiled-cord";
import { HowItWorks } from "@/components/how-it-works";
import { Counter } from "@/components/counter";
import { SubmitSection } from "@/components/submit-section";
import { Footer } from "@/components/footer";
import { PsychedelicWaveform } from "@/components/psychedelic-waveform";

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">
      <Hero />
      {/* Full-width psychedelic oscilloscope band with the LIVE marquee
          floating glass-style above its centerline. Three-layer stack:
            z-0: waveform canvas
            z-10: horizontal dimming spotlight so the cards pop off
            z-20: the marquee cards themselves
          `isolation: isolate` locks this context so no ancestor can
          reorder the children. */}
      <section
        className="relative w-full min-h-[920px] md:min-h-[1140px] overflow-hidden bg-background"
        style={{ isolation: "isolate" }}
      >
        <div className="absolute inset-0 z-0" aria-hidden>
          <PsychedelicWaveform />
        </div>
        {/* Horizontal dimming band — eases the waveform brightness
            exactly where the cards live so they clearly sit above it */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[420px] md:h-[520px] z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, oklch(0.10 0.06 285 / 0.55) 25%, oklch(0.10 0.06 285 / 0.7) 50%, oklch(0.10 0.06 285 / 0.55) 75%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20">
          <ComplimentMarquee />
        </div>
      </section>
      <CoiledCord />
      <HowItWorks />
      <CoiledCord flipped />
      <Counter />
      <SubmitSection />
      <Footer />
    </main>
  );
}
