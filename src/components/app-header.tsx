type Props = {
  email: string | null | undefined;
};

export function AppHeader({ email }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-brand-sunset-ember"
          />
          <span className="font-display text-base tracking-tight text-foreground">
            Blue Lake
          </span>
        </div>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            aria-label={email ? `Sign out ${email}` : "Sign out"}
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
