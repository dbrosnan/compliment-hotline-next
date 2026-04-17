export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-border/30 py-12 px-6 text-center text-sm text-muted-foreground"
      role="contentinfo"
    >
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="font-display text-3xl text-foreground">COMPLIMENT HOTLINE</div>
        <p>An art piece, a cart, eight phones, and you.</p>
        <nav aria-label="Footer" className="flex justify-center gap-6">
          <a
            href="#how"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            How it works
          </a>
          <a
            href="#submit"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            Leave one
          </a>
          <a
            href="mailto:hello@complimenthotline.org"
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            aria-label="Email hello at complimenthotline dot org"
          >
            Say hi
          </a>
        </nav>
        <div className="text-xs text-muted-foreground/50">
          © {year} Compliment Hotline. All kindness reserved.
        </div>
      </div>
    </footer>
  );
}
