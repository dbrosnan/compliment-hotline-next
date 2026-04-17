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
          floating glass-style above its centerline. `isolation: isolate`
          creates a fresh stacking context so the z-layering below is
          absolute and can't be overridden by ancestor contexts. */}
      <section
        className="relative w-full min-h-[420px] md:min-h-[520px] overflow-hidden bg-background"
        style={{ isolation: "isolate" }}
      >
        <div className="absolute inset-0 z-0" aria-hidden>
          <PsychedelicWaveform />
        </div>
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
