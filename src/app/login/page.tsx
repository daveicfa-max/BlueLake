import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-10">
      <Image
        src="/branding/cabin-glow.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,29,40,0.65)_0%,rgba(15,29,40,0.45)_50%,rgba(15,29,40,0.85)_100%)]"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center text-white">
          <h1 className="font-display text-5xl tracking-tight">Blue Lake</h1>
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-white/75">
            There are no rules.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/95 p-6 shadow-[0_24px_60px_-20px_rgba(8,18,28,0.6)] backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-1.5">
            <h2 className="font-display text-xl text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Email yourself a magic link.
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-white/50">
          Mom's sign on the porch wall
        </p>
      </div>
    </main>
  );
}
