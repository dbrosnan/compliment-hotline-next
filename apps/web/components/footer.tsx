export function Footer() {
  return (
    <footer className="border-t border-border/20 py-12 px-6 text-center text-sm text-muted-foreground">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="font-display text-3xl text-foreground">COMPLIMENT HOTLINE</div>
        <div>An art piece, a cart, eight phones, and you.</div>
        <div className="flex justify-center gap-6">
          <a href="#how" className="hover:text-primary transition-colors">How it works</a>
          <a href="#submit" className="hover:text-primary transition-colors">Leave one</a>
          <a href="mailto:hello@complimenthotline.org" className="hover:text-primary transition-colors">Say hi</a>
        </div>
        <div className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} Compliment Hotline. All kindness reserved.</div>
      </div>
    </footer>
  );
}
