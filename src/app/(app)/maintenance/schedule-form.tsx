"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ScheduleFormState } from "./actions";
import type { Equipment, MaintenanceSchedule } from "@/lib/types";

const initial: ScheduleFormState = { status: "idle" };

const SELECT_CLASS =
  "h-11 rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

type Props = {
  action: (
    prev: ScheduleFormState,
    formData: FormData,
  ) => Promise<ScheduleFormState>;
  equipment: Equipment[];
  schedule?: MaintenanceSchedule;
  defaultEquipmentId?: string;
  submitLabel?: string;
};

export function ScheduleForm({
  action,
  equipment,
  schedule,
  defaultEquipmentId,
  submitLabel = "Save schedule",
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);
  const equipmentDefault =
    schedule?.equipment_id ?? defaultEquipmentId ?? equipment[0]?.id ?? "";
  const lastCompletedDefault = schedule?.last_completed_at
    ? schedule.last_completed_at.slice(0, 10)
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="equipment_id"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Equipment
        </Label>
        <select
          id="equipment_id"
          name="equipment_id"
          required
          defaultValue={equipmentDefault}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Pick equipment…
          </option>
          {equipment.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.model ? ` · ${e.model}` : ""}
            </option>
          ))}
        </select>
        {state.fieldErrors?.equipment_id && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.equipment_id}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="name"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Service name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="Replace filter"
          defaultValue={schedule?.name ?? ""}
          className="h-11 text-base"
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="interval_months"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Every (months)
          </Label>
          <Input
            id="interval_months"
            name="interval_months"
            type="number"
            inputMode="numeric"
            min={1}
            required
            placeholder="6"
            defaultValue={schedule?.interval_months ?? ""}
            className="h-11 text-base"
          />
          {state.fieldErrors?.interval_months && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.interval_months}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="last_completed_at"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Last serviced
          </Label>
          <Input
            id="last_completed_at"
            name="last_completed_at"
            type="date"
            defaultValue={lastCompletedDefault}
            className="h-11 text-base"
          />
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
          placeholder="Quirks, parts, who usually does it."
          defaultValue={schedule?.notes ?? ""}
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
