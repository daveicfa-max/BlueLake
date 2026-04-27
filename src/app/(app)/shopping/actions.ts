"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const NameSchema = z.string().trim().min(1, "Name it.").max(200);
const NotesSchema = z.string().trim().max(2000).optional().or(z.literal(""));

export type ShoppingFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function addItem(
  _prev: ShoppingFormState,
  formData: FormData,
): Promise<ShoppingFormState> {
  const nameResult = NameSchema.safeParse(formData.get("name"));
  const notesResult = NotesSchema.safeParse(formData.get("notes") ?? "");

  if (!nameResult.success) {
    return { status: "error", message: nameResult.error.issues[0].message };
  }
  if (!notesResult.success) {
    return { status: "error", message: "Notes are too long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const { error } = await supabase.from("shopping_items").insert({
    name: nameResult.data,
    notes: notesResult.data?.trim() || null,
    added_by: user.id,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/shopping");
  return { status: "idle" };
}

export async function markPickedUp(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("shopping_items")
    .update({ picked_up_at: new Date().toISOString(), picked_up_by: user.id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shopping");
}

export async function undoPickedUp(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_items")
    .update({ picked_up_at: null, picked_up_by: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shopping");
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shopping");
}
