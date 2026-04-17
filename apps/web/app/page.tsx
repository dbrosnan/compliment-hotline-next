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
      {/* Full-width psychedelic oscilloscope band — sits directly below
          the hero video for a seamless "the waveform breaks out of the
          frame" moment. */}
      <section
        aria-hidden
        className="relative w-full h-[40vh] min-h-[280px] max-h-[520px] overflow-hidden bg-background"
      >
        <PsychedelicWaveform />
      </section>
      <ComplimentMarquee />
      <CoiledCord />
      <HowItWorks />
      <CoiledCord flipped />
      <Counter />
      <SubmitSection />
      <Footer />
    </main>
  );
}
