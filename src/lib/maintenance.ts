import "server-only";
import { createClient } from "./supabase/server";
import type {
  MaintenanceSchedule,
  MaintenanceScheduleWithEquipment,
} from "./types";

const SCHEDULE_WITH_EQUIPMENT =
  "*, equipment:equipment(id, name, category, model, manual_url)";

export async function getSchedules(): Promise<MaintenanceScheduleWithEquipment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select(SCHEDULE_WITH_EQUIPMENT)
    .order("next_due_at", { ascending: true });
  if (error) {
    console.error("getSchedules:", error);
    return [];
  }
  return (data ?? []) as MaintenanceScheduleWithEquipment[];
}

export async function getSchedulesByEquipment(
  equipmentId: string,
): Promise<MaintenanceSchedule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select("*")
    .eq("equipment_id", equipmentId)
    .order("next_due_at", { ascending: true });
  if (error) {
    console.error("getSchedulesByEquipment:", error);
    return [];
  }
  return (data ?? []) as MaintenanceSchedule[];
}

export async function getScheduleById(
  id: string,
): Promise<MaintenanceScheduleWithEquipment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select(SCHEDULE_WITH_EQUIPMENT)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getScheduleById:", error);
    return null;
  }
  return (data as MaintenanceScheduleWithEquipment) ?? null;
}

export async function getDashboardSchedules(
  windowDays = 30,
  limit = 3,
): Promise<MaintenanceScheduleWithEquipment[]> {
  const supabase = await createClient();
  const cutoff = new Date(
    Date.now() + windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select(SCHEDULE_WITH_EQUIPMENT)
    .lte("next_due_at", cutoff)
    .order("next_due_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("getDashboardSchedules:", error);
    return [];
  }
  return (data ?? []) as MaintenanceScheduleWithEquipment[];
}

export async function getDueSoonCount(windowDays = 30): Promise<number> {
  const supabase = await createClient();
  const cutoff = new Date(
    Date.now() + windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { count, error } = await supabase
    .from("maintenance_schedules")
    .select("id", { count: "exact", head: true })
    .lte("next_due_at", cutoff);
  if (error) {
    console.error("getDueSoonCount:", error);
    return 0;
  }
  return count ?? 0;
}
