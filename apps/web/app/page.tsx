import { Hero } from "@/components/hero";
import { ComplimentMarquee } from "@/components/compliment-marquee";
import { CoiledCord } from "@/components/coiled-cord";
import { HowItWorks } from "@/components/how-it-works";
import { Counter } from "@/components/counter";
import { SubmitSection } from "@/components/submit-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">
      <Hero />
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
