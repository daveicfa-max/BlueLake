"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/types";

const TaskSchema = z
  .object({
    title: z.string().trim().min(1, "Give it a title.").max(200),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    status: z.enum(["open", "in_progress", "done", "cancelled"]),
    priority: z.enum(["low", "normal", "high"]),
    assigned_to: z.uuid().optional().or(z.literal("")),
    due_date: z.iso.date().optional().or(z.literal("")),
    is_seasonal: z
      .union([z.literal("on"), z.literal("true"), z.literal("")])
      .optional()
      .transform((v) => v === "on" || v === "true"),
    season: z
      .enum(["open", "close", "spring", "summer", "fall", "winter"])
      .optional()
      .or(z.literal("")),
  })
  .refine((v) => !v.is_seasonal || !!v.season, {
    message: "Pick a season for seasonal tasks.",
    path: ["season"],
  });

export type TaskFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof TaskSchema>, string>>;
};

function parseForm(formData: FormData) {
  return TaskSchema.safeParse({
    title: (formData.get("title") ?? "").toString(),
    description: (formData.get("description") ?? "").toString(),
    status: (formData.get("status") ?? "open").toString(),
    priority: (formData.get("priority") ?? "normal").toString(),
    assigned_to: (formData.get("assigned_to") ?? "").toString(),
    due_date: (formData.get("due_date") ?? "").toString(),
    is_seasonal: (formData.get("is_seasonal") ?? "").toString(),
    season: (formData.get("season") ?? "").toString(),
  });
}

function fieldErrors(parsed: ReturnType<typeof parseForm>) {
  if (parsed.success) return {};
  const errors: TaskFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof z.infer<typeof TaskSchema>;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function payload(parsed: z.infer<typeof TaskSchema>) {
  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || null,
    status: parsed.status,
    priority: parsed.priority,
    assigned_to: parsed.assigned_to || null,
    due_date: parsed.due_date || null,
    is_seasonal: parsed.is_seasonal,
    season: parsed.is_seasonal ? parsed.season || null : null,
  };
}

export async function createTask(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
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

  const { error } = await supabase.from("tasks").insert({
    ...payload(parsed.data),
    created_by: user.id,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function updateTask(
  id: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
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
    .from("tasks")
    .update(payload(parsed.data))
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/");
}
