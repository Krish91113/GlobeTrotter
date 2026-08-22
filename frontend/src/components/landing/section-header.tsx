interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
  dark?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span
        className={`text-xs font-bold uppercase tracking-[0.2em] ${
          dark ? "text-accent" : "text-primary"
        }`}
      >
        {eyebrow}
      </span>

      <h2
        className={`mt-3 text-3xl font-bold tracking-tight md:text-4xl ${
          dark ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-4 leading-7 ${
          dark ? "text-muted-foreground" : "text-muted-foreground"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
