"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const StaySchema = z
  .object({
    guest_name: z.string().trim().max(120).optional().or(z.literal("")),
    start_date: z.iso.date({ error: "Pick a start date." }),
    end_date: z.iso.date({ error: "Pick an end date." }),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "End date can't be before start date.",
    path: ["end_date"],
  });

export type StayFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof StaySchema>, string>>;
};

function parseForm(formData: FormData) {
  return StaySchema.safeParse({
    guest_name: (formData.get("guest_name") ?? "").toString(),
    start_date: (formData.get("start_date") ?? "").toString(),
    end_date: (formData.get("end_date") ?? "").toString(),
    notes: (formData.get("notes") ?? "").toString(),
  });
}

function fieldErrors(parsed: ReturnType<typeof parseForm>) {
  if (parsed.success) return {};
  const errors: StayFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof z.infer<typeof StaySchema>;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function createStay(
  _prev: StayFormState,
  formData: FormData,
): Promise<StayFormState> {
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

  const { error } = await supabase.from("stays").insert({
    user_id: user.id,
    guest_name: parsed.data.guest_name?.trim() || null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    notes: parsed.data.notes?.trim() || null,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/calendar");
}

export async function updateStay(
  id: string,
  _prev: StayFormState,
  formData: FormData,
): Promise<StayFormState> {
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
    .from("stays")
    .update({
      guest_name: parsed.data.guest_name?.trim() || null,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      notes: parsed.data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/calendar");
}

export async function deleteStay(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("stays").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/calendar");
}
