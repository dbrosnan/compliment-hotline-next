"use client";

import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { Counter } from "./counter";

export function Footer() {
  const year = new Date().getFullYear();
  const scrollToSubmit = () => {
    document.getElementById("submit")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Obfuscated mailto — the address is never written to the rendered
  // HTML or as a literal href for scrapers to harvest. Assembled at
  // click time from rot13'd parts and opened via window.location.
  const rot13 = (s: string) =>
    s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  const sayHi = () => {
    const user = rot13("qerjoebfnna"); // drewbrosnan
    const domain = rot13("tznvy.pbz"); // gmail.com
    window.location.href = `mailto:${user}@${domain}`;
  };
  return (
    <footer
      className="border-t border-border/30 py-12 px-6 text-center text-sm text-muted-foreground"
      role="contentinfo"
      style={{ width: "100%" }}
    >
      <div
        className="w-full max-w-3xl mx-auto space-y-4"
        style={{ width: "100%", maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}
      >
        {/* Responsive wordmark — shrinks on mobile so it doesn't overflow */}
        <div
          className="font-display text-xl sm:text-2xl md:text-3xl text-foreground"
          style={{ width: "100%", wordBreak: "keep-all" }}
        >
          COMPLIMENT HOTLINE
        </div>

        {/* Running total counter — moved here from mid-page so the
            wordmark + running tally live together as the footer cap. */}
        <div className="pt-2 pb-4">
          <Counter />
        </div>

        <div className="flex justify-center pt-2">
          <ShimmerButton
            onClick={scrollToSubmit}
            shimmerColor="oklch(0.89 0.17 92)"
            background="oklch(0.72 0.21 22)"
            borderRadius="9999px"
            shimmerDuration="2.4s"
            className="text-sm font-semibold text-midnight"
            aria-label="Jump to leave a compliment"
          >
            Leave one →
          </ShimmerButton>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2"
          style={{ width: "100%" }}
        >
          <a
            href="#how"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded whitespace-nowrap"
          >
            How it works
          </a>
          <a
            href="#submit"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded whitespace-nowrap"
          >
            Leave one
          </a>
          <button
            type="button"
            onClick={sayHi}
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded whitespace-nowrap cursor-pointer bg-transparent border-0 p-0 font-[inherit] text-inherit"
            aria-label="Open your email client to say hi"
          >
            Say hi
          </button>
        </nav>

        {/* Tagline now sits below the nav, just above the copyright */}
        <p
          className="text-sm sm:text-base"
          style={{ width: "100%", maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
        >
          An art piece, a cart, eight phones, and you.
        </p>

        <p
          className="text-xs text-muted-foreground/50"
          style={{ width: "100%", maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
        >
          © {year} Compliment Hotline. All kindness reserved.
        </p>
      </div>
    </footer>
  );
}
