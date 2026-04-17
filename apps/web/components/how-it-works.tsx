import { Card, CardContent } from "@workspace/ui/components/card";

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
        <div className="mb-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            The whole bit
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-foreground">HOW IT WORKS</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Card
              key={s.n}
              className="group relative overflow-hidden bg-card/60 border-border/30 p-0"
            >
              <CardContent className="p-6">
                <div className={`font-display text-5xl ${s.accent} mb-4`}>{s.n}</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </CardContent>
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-coral/10 blur-2xl transition-colors duration-500 group-hover:bg-coral/30" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
