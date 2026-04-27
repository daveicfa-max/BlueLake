"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dollarsToCents } from "@/lib/money";
import type { BidStatus } from "@/lib/types";

const AmountSchema = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .transform((v) => dollarsToCents(v))
  .refine((v): v is number => v !== null && v > 0, "Enter a valid dollar amount.");

const NotesSchema = z.string().trim().max(2000).optional().or(z.literal(""));

export type BillingFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function createBid(
  taskId: string,
  _prev: BillingFormState,
  formData: FormData,
): Promise<BillingFormState> {
  const amountResult = AmountSchema.safeParse(formData.get("amount"));
  const notesResult = NotesSchema.safeParse(formData.get("notes") ?? "");

  if (!amountResult.success) {
    return { status: "error", message: amountResult.error.issues[0].message };
  }
  if (!notesResult.success) {
    return { status: "error", message: "Notes are too long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const { error } = await supabase.from("task_bids").insert({
    task_id: taskId,
    created_by: user.id,
    amount_cents: amountResult.data,
    notes: notesResult.data?.trim() || null,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/tasks/${taskId}`);
  return { status: "idle" };
}

export async function setBidStatus(
  taskId: string,
  bidId: string,
  status: BidStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_bids")
    .update({ status })
    .eq("id", bidId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteBid(taskId: string, bidId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("task_bids").delete().eq("id", bidId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function createInvoice(
  taskId: string,
  _prev: BillingFormState,
  formData: FormData,
): Promise<BillingFormState> {
  const amountResult = AmountSchema.safeParse(formData.get("amount"));
  const notesResult = NotesSchema.safeParse(formData.get("notes") ?? "");

  if (!amountResult.success) {
    return { status: "error", message: amountResult.error.issues[0].message };
  }
  if (!notesResult.success) {
    return { status: "error", message: "Notes are too long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const { error } = await supabase.from("task_invoices").insert({
    task_id: taskId,
    created_by: user.id,
    amount_cents: amountResult.data,
    notes: notesResult.data?.trim() || null,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/tasks/${taskId}`);
  return { status: "idle" };
}

export async function markInvoicePaid(
  taskId: string,
  invoiceId: string,
  formData: FormData,
) {
  const method = (formData.get("payment_method") ?? "").toString().trim();
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_invoices")
    .update({
      paid_at: new Date().toISOString(),
      payment_method: method || null,
    })
    .eq("id", invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function unmarkInvoicePaid(taskId: string, invoiceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_invoices")
    .update({ paid_at: null, payment_method: null })
    .eq("id", invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteInvoice(taskId: string, invoiceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_invoices")
    .delete()
    .eq("id", invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}
