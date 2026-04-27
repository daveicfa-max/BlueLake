type Props = {
  eyebrow?: React.ReactNode;
  title: string;
  blurb?: string;
  children?: React.ReactNode;
};

export function PageScaffold({ eyebrow, title, blurb, children }: Props) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-10">
      <header className="flex flex-col gap-1.5">
        {eyebrow && (
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl tracking-tight text-foreground text-balance">
          {title}
        </h1>
        {blurb && (
          <p className="text-sm text-muted-foreground text-pretty">{blurb}</p>
        )}
      </header>
      {children}
    </div>
  );
}

type PhasePlaceholderProps = {
  phase: string;
  blurb: string;
};

export function PhasePlaceholder({ phase, blurb }: PhasePlaceholderProps) {
  return (
    <div className="mt-2 rounded-2xl border border-border/80 border-dashed bg-muted/30 px-5 py-8 text-center">
      <p className="font-data text-[10px] uppercase tracking-[0.22em] text-brand-sunset-ember">
        {phase}
      </p>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">{blurb}</p>
    </div>
  );
}
