"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaskFormState } from "./actions";
import type { Profile, Task } from "@/lib/types";

const initial: TaskFormState = { status: "idle" };

const STATUSES: { value: string; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITIES: { value: string; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

const SEASONS: { value: string; label: string }[] = [
  { value: "open", label: "Cabin opening" },
  { value: "close", label: "Cabin closing" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

type Props = {
  action: (prev: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  task?: Task;
  assignees: Profile[];
  submitLabel?: string;
};

const SELECT_CLASS =
  "h-11 rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export function TaskForm({ action, task, assignees, submitLabel = "Save task" }: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);
  const [seasonal, setSeasonal] = useState(task?.is_seasonal ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="title"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          What needs doing
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          autoComplete="off"
          placeholder="Replace pump filter"
          defaultValue={task?.title ?? ""}
          className="h-11 text-base"
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="description"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Details
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="The 20-micron in the basement. Spare's on the workbench."
          defaultValue={task?.description ?? ""}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="status"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Status
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? "open"}
            className={SELECT_CLASS}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="priority"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Priority
          </Label>
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? "normal"}
            className={SELECT_CLASS}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="assigned_to"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Assigned to
        </Label>
        <select
          id="assigned_to"
          name="assigned_to"
          defaultValue={task?.assigned_to ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Nobody yet</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name ?? "Unnamed"} · {a.role}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="due_date"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Due
        </Label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          defaultValue={task?.due_date ?? ""}
          className="h-11 text-base"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_seasonal"
            checked={seasonal}
            onChange={(e) => setSeasonal(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-foreground"
          />
          <span className="text-sm text-foreground">Seasonal task</span>
        </label>
        {seasonal && (
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="season"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Season
            </Label>
            <select
              id="season"
              name="season"
              defaultValue={task?.season ?? ""}
              className={SELECT_CLASS}
            >
              <option value="">Pick one…</option>
              {SEASONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {state.fieldErrors?.season && (
              <p className="text-xs text-destructive">{state.fieldErrors.season}</p>
            )}
          </div>
        )}
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
