"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { submitText } from "@/lib/api";

const MAX = 500;

export function TextForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      await submitText({ name: name.trim() || undefined, message: message.trim(), hp });
      setStatus("ok");
      setMessage("");
      setName("");
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "Something went sideways.");
    }
  };

  if (status === "ok") {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">📞</div>
        <h3 className="font-display text-4xl text-mint mb-2">QUEUED</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you. It goes through moderation, then gets piped to a real phone.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")} className="mt-6 rounded-full">
          Leave another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full space-y-5" style={{ width: "100%" }} noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="hp"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden
      />

      <div className="w-full space-y-2" style={{ width: "100%" }}>
        <Label htmlFor="ch-name" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your name (optional)
        </Label>
        <Input
          id="ch-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="a stranger"
          className="w-full h-12 rounded-lg bg-background/40 border-border/50 focus-visible:border-primary focus-visible:ring-primary/40"
          style={{ width: "100%" }}
        />
      </div>

      <div className="w-full space-y-2" style={{ width: "100%" }}>
        <Label htmlFor="ch-message" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your compliment
        </Label>
        <Textarea
          id="ch-message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          required
          rows={5}
          placeholder="your laugh is contagious and i hope you know it"
          aria-describedby="ch-message-hint ch-message-count"
          className="w-full min-h-[8rem] rounded-lg bg-background/40 border-border/50 focus-visible:border-primary focus-visible:ring-primary/40 font-serif text-lg leading-snug resize-none"
          style={{ width: "100%" }}
        />
        <div className="flex w-full justify-between text-xs text-muted-foreground" style={{ width: "100%" }}>
          <span id="ch-message-hint">Be kind. Be specific.</span>
          <span id="ch-message-count" className="font-mono" aria-live="polite">
            {message.length} / {MAX}
          </span>
        </div>
      </div>

      {status === "err" && (
        <p className="text-destructive text-sm" role="alert">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "sending" || !message.trim()}
        aria-busy={status === "sending"}
        className="w-full rounded-full shadow-glow"
        style={{ width: "100%" }}
      >
        {status === "sending" ? "Sending..." : "Send it through"}
      </Button>
    </form>
  );
}
