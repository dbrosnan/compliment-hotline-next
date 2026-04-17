export function Footer() {
  const year = new Date().getFullYear();
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

        <p
          className="text-sm sm:text-base"
          style={{ width: "100%", maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
        >
          An art piece, a cart, eight phones, and you.
        </p>

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
          <a
            href="mailto:hello@complimenthotline.org"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded whitespace-nowrap"
            aria-label="Email hello at complimenthotline dot org"
          >
            Say hi
          </a>
        </nav>

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
