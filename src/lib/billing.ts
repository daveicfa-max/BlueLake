import "server-only";
import { createClient } from "./supabase/server";
import type { TaskBidWithProfile, TaskInvoiceWithProfile } from "./types";

export async function getBidsForTask(taskId: string): Promise<TaskBidWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_bids")
    .select("*, creator:profiles!task_bids_created_by_fkey(full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getBidsForTask:", error);
    return [];
  }
  return (data ?? []) as TaskBidWithProfile[];
}

export async function getInvoicesForTask(
  taskId: string,
): Promise<TaskInvoiceWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_invoices")
    .select("*, creator:profiles!task_invoices_created_by_fkey(full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getInvoicesForTask:", error);
    return [];
  }
  return (data ?? []) as TaskInvoiceWithProfile[];
}

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.role as string) ?? null;
}
