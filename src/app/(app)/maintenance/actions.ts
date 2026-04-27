"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ScheduleSchema = z.object({
  equipment_id: z.uuid("Pick a piece of equipment."),
  name: z.string().trim().min(1, "Give it a name.").max(200),
  interval_months: z.coerce
    .number()
    .int()
    .positive("Pick an interval in months."),
  last_completed_at: z.iso.date().optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ScheduleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof ScheduleSchema>, string>>;
};

function parseForm(formData: FormData) {
  return ScheduleSchema.safeParse({
    equipment_id: (formData.get("equipment_id") ?? "").toString(),
    name: (formData.get("name") ?? "").toString(),
    interval_months: (formData.get("interval_months") ?? "").toString(),
    last_completed_at: (formData.get("last_completed_at") ?? "").toString(),
    notes: (formData.get("notes") ?? "").toString(),
  });
}

function fieldErrors(parsed: ReturnType<typeof parseForm>) {
  if (parsed.success) return {};
  const errors: ScheduleFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof z.infer<typeof ScheduleSchema>;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function payload(parsed: z.infer<typeof ScheduleSchema>) {
  const completed = parsed.last_completed_at
    ? new Date(parsed.last_completed_at).toISOString()
    : new Date().toISOString();
  return {
    equipment_id: parsed.equipment_id,
    name: parsed.name.trim(),
    interval_months: parsed.interval_months,
    last_completed_at: completed,
    notes: parsed.notes?.trim() || null,
  };
}

export async function createSchedule(
  _prev: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the form and try again.",
      fieldErrors: fieldErrors(parsed),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const { error } = await supabase.from("maintenance_schedules").insert({
    ...payload(parsed.data),
    created_by: user.id,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/maintenance");
  revalidatePath("/");
  redirect("/maintenance");
}

export async function updateSchedule(
  id: string,
  _prev: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the form and try again.",
      fieldErrors: fieldErrors(parsed),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("maintenance_schedules")
    .update(payload(parsed.data))
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${id}`);
  revalidatePath("/");
  redirect("/maintenance");
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("maintenance_schedules")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/maintenance");
  revalidatePath("/");
  redirect("/maintenance");
}

export async function createTaskFromSchedule(scheduleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: schedule, error: scheduleError } = await supabase
    .from("maintenance_schedules")
    .select(
      "*, equipment:equipment(id, name, model, manual_url, install_date)",
    )
    .eq("id", scheduleId)
    .maybeSingle();
  if (scheduleError) throw new Error(scheduleError.message);
  if (!schedule) throw new Error("Schedule not found.");

  const eq = (
    schedule as typeof schedule & {
      equipment: {
        id: string;
        name: string;
        model: string | null;
        manual_url: string | null;
        install_date: string | null;
      } | null;
    }
  ).equipment;
  const eqName = eq?.name ?? "equipment";

  const lines: string[] = [`Service: ${schedule.name}`];
  if (eq?.model) lines.push(`Model: ${eq.model}`);
  if (schedule.last_completed_at) {
    lines.push(
      `Last serviced: ${schedule.last_completed_at.slice(0, 10)}`,
    );
  }
  if (eq?.manual_url) lines.push(`Manual: ${eq.manual_url}`);
  if (schedule.notes) lines.push(`Notes: ${schedule.notes}`);

  const due = schedule.next_due_at
    ? schedule.next_due_at.slice(0, 10)
    : null;

  const { data: created, error } = await supabase
    .from("tasks")
    .insert({
      title: `Service: ${eqName}`,
      description: lines.join("\n"),
      status: "open",
      priority: "normal",
      is_seasonal: false,
      season: null,
      due_date: due,
      maintenance_schedule_id: schedule.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${scheduleId}`);
  revalidatePath("/");
  redirect(`/tasks/${created.id}`);
}
