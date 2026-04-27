import "server-only";
import { addDays } from "date-fns";
import { createClient } from "./supabase/server";
import { todayIsoAtLake } from "./dates";
import type { Profile, Task, TaskWithProfiles } from "./types";

export type TaskView = "all" | "mine" | "handyman" | "seasonal";

export async function getTasks(view: TaskView): Promise<TaskWithProfiles[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("tasks")
    .select(
      "*, assignee:profiles!tasks_assigned_to_fkey(full_name), creator:profiles!tasks_created_by_fkey(full_name)",
    )
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (view === "mine") {
    query = query.or(
      `assigned_to.eq.${user.id},created_by.eq.${user.id}`,
    );
  } else if (view === "handyman") {
    query = query
      .not("assigned_to", "is", null)
      .in("status", ["open", "in_progress"]);
  } else if (view === "seasonal") {
    query = query.eq("is_seasonal", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getTasks:", error);
    return [];
  }
  return (data ?? []) as TaskWithProfiles[];
}

export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getTaskById:", error);
    return null;
  }
  return (data as Task) ?? null;
}

export async function getTaskCounts(): Promise<{
  open: number;
  dueThisWeek: number;
}> {
  const supabase = await createClient();
  const today = todayIsoAtLake();
  const weekOut = addDays(new Date(today), 7).toISOString().slice(0, 10);

  const [openRes, dueRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"])
      .not("due_date", "is", null)
      .gte("due_date", today)
      .lte("due_date", weekOut),
  ]);

  return {
    open: openRes.count ?? 0,
    dueThisWeek: dueRes.count ?? 0,
  };
}

export async function getAssignableUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, avatar_url")
    .in("role", ["owner", "family", "handyman"])
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });
  if (error) {
    console.error("getAssignableUsers:", error);
    return [];
  }
  return (data ?? []) as Profile[];
}
