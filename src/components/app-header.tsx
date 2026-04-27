type Props = {
  email: string | null | undefined;
};

export function AppHeader({ email }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-xl">🌲</span>
          <span className="font-semibold tracking-tight">Blue Lake</span>
        </div>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label={email ? `Sign out ${email}` : "Sign out"}
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
