"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { SectionHeading } from "./section-heading";
import { TextForm } from "./text-form";
import { RotaryRecorder } from "./rotary-recorder";

export function SubmitSection() {
  return (
    <section id="submit" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="Your turn"
          title="LEAVE ONE"
          tagline="Kind. Specific. 30 seconds or 500 characters. Gets queued, reviewed, then plays on a real phone at the next festival."
          className="mb-10"
        />

        <Card className="w-full bg-card/70 border-border/25 backdrop-blur-sm shadow-md" style={{ width: "100%" }}>
          <CardContent className="w-full p-6 md:p-10" style={{ width: "100%" }}>
            <Tabs
              defaultValue="text"
              className="w-full"
              style={{ display: "block", width: "100%" }}
            >
              <TabsList className="mx-auto mb-8 w-fit">
                <TabsTrigger value="text">✍️ Text</TabsTrigger>
                <TabsTrigger value="audio">🎙 Audio</TabsTrigger>
              </TabsList>
              <TabsContent
                value="text"
                className="w-full"
                style={{ display: "block", width: "100%", minWidth: 0 }}
              >
                <TextForm />
              </TabsContent>
              <TabsContent
                value="audio"
                className="w-full"
                style={{ display: "block", width: "100%", minWidth: 0 }}
              >
                <RotaryRecorder />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
