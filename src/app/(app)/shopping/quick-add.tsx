"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { addItem, type ShoppingFormState } from "./actions";

const initial: ShoppingFormState = { status: "idle" };

export function QuickAdd() {
  const [state, formAction, isPending] = useActionState(addItem, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "idle" && !isPending) {
      formRef.current?.reset();
    }
  }, [state, isPending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="Salt, propane, coffee filters…"
          className="h-11 flex-1 text-base"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 items-center gap-1 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60 transition"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {state.status === "error" && state.message && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
    </form>
  );
}
