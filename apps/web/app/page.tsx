import { Hero } from "@/components/hero";
import { ComplimentMarquee } from "@/components/compliment-marquee";
import { HowItWorks } from "@/components/how-it-works";
import { SubmitSection } from "@/components/submit-section";
import { Footer } from "@/components/footer";
import { PsychedelicWaveform } from "@/components/psychedelic-waveform";
import { MCMDivider } from "@/components/mcm-divider";
import { Boomerang, KidneyBean, Sputnik } from "@/components/mcm-ornaments";

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
          reorder the children. Height bumped to 970/1200 to accommodate
          the MCM bezel frame added by Agent B. */}
      <section
        className="relative w-full min-h-[970px] md:min-h-[1200px] overflow-hidden bg-background"
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
      <MCMDivider variant="starburst" />
      <HowItWorks />
      <MCMDivider variant="curve" />
      <SubmitSection />
      <Footer />

      {/* Scattered MCM ornaments — page-level decorative layer. Pointer-events
          disabled so they never interfere with real interactions. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          style={{
            position: "absolute",
            top: "8vh",
            right: "3vw",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        >
          <Sputnik size={56} color="oklch(0.72 0.21 22)" />
        </div>
        <div
          style={{
            position: "absolute",
            top: "120vh",
            left: "2vw",
            opacity: 0.5,
            transform: "rotate(-15deg)",
          }}
        >
          <Boomerang size={64} color="oklch(0.70 0.28 338)" />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "30vh",
            right: "5vw",
            opacity: 0.55,
          }}
        >
          <KidneyBean size={80} />
        </div>
        <div
          style={{
            position: "absolute",
            top: "180vh",
            left: "50vw",
            opacity: 0.5,
          }}
        >
          <Sputnik size={40} color="oklch(0.89 0.15 162)" />
        </div>
      </div>
    </main>
  );
}
