"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EquipmentFormState } from "./actions";
import type { Equipment } from "@/lib/types";

const initial: EquipmentFormState = { status: "idle" };

const CATEGORIES: { value: string; label: string }[] = [
  { value: "hvac", label: "HVAC" },
  { value: "septic", label: "Septic" },
  { value: "well", label: "Well" },
  { value: "dock", label: "Dock" },
  { value: "generator", label: "Generator" },
  { value: "appliance", label: "Appliance" },
  { value: "other", label: "Other" },
];

const SELECT_CLASS =
  "h-11 rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

type Props = {
  action: (
    prev: EquipmentFormState,
    formData: FormData,
  ) => Promise<EquipmentFormState>;
  equipment?: Equipment;
  submitLabel?: string;
};

export function EquipmentForm({
  action,
  equipment,
  submitLabel = "Save equipment",
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="name"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="Well pump"
          defaultValue={equipment?.name ?? ""}
          className="h-11 text-base"
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="category"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Category
        </Label>
        <select
          id="category"
          name="category"
          defaultValue={equipment?.category ?? "other"}
          className={SELECT_CLASS}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="model"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Model
          </Label>
          <Input
            id="model"
            name="model"
            type="text"
            autoComplete="off"
            placeholder="GT-15"
            defaultValue={equipment?.model ?? ""}
            className="h-11 text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="serial"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Serial
          </Label>
          <Input
            id="serial"
            name="serial"
            type="text"
            autoComplete="off"
            defaultValue={equipment?.serial ?? ""}
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="install_date"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Installed
        </Label>
        <Input
          id="install_date"
          name="install_date"
          type="date"
          defaultValue={equipment?.install_date ?? ""}
          className="h-11 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="manual_url"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Manual URL
        </Label>
        <Input
          id="manual_url"
          name="manual_url"
          type="url"
          autoComplete="off"
          placeholder="https://..."
          defaultValue={equipment?.manual_url ?? ""}
          className="h-11 text-base"
        />
        {state.fieldErrors?.manual_url && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.manual_url}
          </p>
        )}
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
          placeholder="Where it lives, who installed it, quirks."
          defaultValue={equipment?.notes ?? ""}
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
