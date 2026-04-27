"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StayFormState } from "./actions";
import type { Stay } from "@/lib/types";

const initial: StayFormState = { status: "idle" };

type Props = {
  action: (prev: StayFormState, formData: FormData) => Promise<StayFormState>;
  stay?: Stay;
  submitLabel?: string;
};

export function StayForm({ action, stay, submitLabel = "Save stay" }: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="guest_name"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Who's coming
        </Label>
        <Input
          id="guest_name"
          name="guest_name"
          type="text"
          autoComplete="off"
          placeholder="Susan, Jon, the boys, you…"
          defaultValue={stay?.guest_name ?? ""}
          className="h-11 text-base"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank if it's just you.
        </p>
        {state.fieldErrors?.guest_name && (
          <p className="text-xs text-destructive">{state.fieldErrors.guest_name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="start_date"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Arrives
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={stay?.start_date}
            className="h-11 text-base"
          />
          {state.fieldErrors?.start_date && (
            <p className="text-xs text-destructive">{state.fieldErrors.start_date}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="end_date"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Leaves
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            required
            defaultValue={stay?.end_date}
            className="h-11 text-base"
          />
          {state.fieldErrors?.end_date && (
            <p className="text-xs text-destructive">{state.fieldErrors.end_date}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="notes"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Notes
        </Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Boat's already in. Susan's bringing the kids."
          defaultValue={stay?.notes ?? ""}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60"
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>

      {state.status === "error" && state.message && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
