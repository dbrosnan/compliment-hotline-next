"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { TextForm } from "./text-form";
import { RotaryRecorder } from "./rotary-recorder";

export function SubmitSection() {
  return (
    <section id="submit" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Your turn
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-foreground">LEAVE ONE</h2>
          <p
            className="mt-4 font-serif italic text-lg md:text-xl text-muted-foreground"
            style={{ display: "block", width: "100%", maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}
          >
            Kind. Specific. 30 seconds or 500 characters. Gets queued, reviewed, then plays on a real phone at the next festival.
          </p>
        </div>

        <Card className="bg-card/70 border-border/25 backdrop-blur-sm shadow-md">
          <CardContent className="p-6 md:p-10">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="mx-auto mb-8 w-fit">
                <TabsTrigger value="text">✍️ Text</TabsTrigger>
                <TabsTrigger value="audio">🎙 Audio</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <TextForm />
              </TabsContent>
              <TabsContent value="audio">
                <RotaryRecorder />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
