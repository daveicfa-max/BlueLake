"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const EquipmentSchema = z.object({
  name: z.string().trim().min(1, "Give it a name.").max(200),
  category: z.enum([
    "hvac",
    "septic",
    "well",
    "dock",
    "generator",
    "appliance",
    "other",
  ]),
  model: z.string().trim().max(200).optional().or(z.literal("")),
  serial: z.string().trim().max(200).optional().or(z.literal("")),
  install_date: z.iso.date().optional().or(z.literal("")),
  manual_url: z.url("Manual URL doesn't look right.").optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type EquipmentFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof EquipmentSchema>, string>>;
};

function parseForm(formData: FormData) {
  return EquipmentSchema.safeParse({
    name: (formData.get("name") ?? "").toString(),
    category: (formData.get("category") ?? "other").toString(),
    model: (formData.get("model") ?? "").toString(),
    serial: (formData.get("serial") ?? "").toString(),
    install_date: (formData.get("install_date") ?? "").toString(),
    manual_url: (formData.get("manual_url") ?? "").toString(),
    notes: (formData.get("notes") ?? "").toString(),
  });
}

function fieldErrors(parsed: ReturnType<typeof parseForm>) {
  if (parsed.success) return {};
  const errors: EquipmentFormState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof z.infer<typeof EquipmentSchema>;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function payload(parsed: z.infer<typeof EquipmentSchema>) {
  return {
    name: parsed.name.trim(),
    category: parsed.category,
    model: parsed.model?.trim() || null,
    serial: parsed.serial?.trim() || null,
    install_date: parsed.install_date || null,
    manual_url: parsed.manual_url?.trim() || null,
    notes: parsed.notes?.trim() || null,
  };
}

export async function createEquipment(
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
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

  const { error } = await supabase.from("equipment").insert({
    ...payload(parsed.data),
    created_by: user.id,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function updateEquipment(
  id: string,
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
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
    .from("equipment")
    .update(payload(parsed.data))
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${id}`);
  redirect("/equipment");
}

export async function deleteEquipment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/equipment");
  revalidatePath("/maintenance");
  redirect("/equipment");
}
