type Props = {
  eyebrow?: string;
  title: string;
  tagline?: string;
  id?: string;
  className?: string;
};

/**
 * Shared marketing section header: small uppercase eyebrow in font-mono,
 * big h2 in font-display, optional tagline in font-serif italic.
 *
 * The tagline <p> carries an explicit `style` override because Tailwind v4
 * + shadcn Lyra collapses `mx-auto max-w-*` without `w-full` to its
 * narrowest unbreakable content (see DESIGN.md "Known quirks").
 */
export function SectionHeading({ eyebrow, title, tagline, id, className }: Props) {
  return (
    <div className={`text-center ${className ?? ""}`} id={id}>
      {eyebrow && (
        <p className="font-mono mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-5xl md:text-7xl leading-none text-foreground">
        {title}
      </h2>
      {tagline && (
        <p
          className="mt-4 font-serif italic text-lg md:text-xl text-muted-foreground leading-relaxed"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "36rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {tagline}
        </p>
      )}
    </div>
  );
}
