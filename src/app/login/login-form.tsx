"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    sendMagicLink,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          inputMode="email"
          className="h-11 text-base"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send magic link"}
      </Button>

      {state.status === "sent" && (
        <p className="rounded-lg bg-brand-pine/10 px-3 py-2 text-sm text-brand-pine">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
