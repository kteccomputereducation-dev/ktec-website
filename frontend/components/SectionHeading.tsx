export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : ""}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-signal">
          <span className="h-px w-6 bg-signal" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {description && <p className="mt-3 text-slate leading-relaxed">{description}</p>}
    </div>
  );
}
