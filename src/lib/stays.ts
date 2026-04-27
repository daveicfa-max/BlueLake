import "server-only";
import { createClient } from "./supabase/server";
import { todayIsoAtLake } from "./dates";
import type { Stay, StayWithProfile } from "./types";

export async function getStaysInRange(
  startIso: string,
  endIso: string,
): Promise<StayWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*, profile:profiles(full_name)")
    .lte("start_date", endIso)
    .gte("end_date", startIso)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("getStaysInRange:", error);
    return [];
  }
  return (data ?? []) as StayWithProfile[];
}

export async function getCurrentStay(): Promise<StayWithProfile | null> {
  const today = todayIsoAtLake();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*, profile:profiles(full_name)")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getCurrentStay:", error);
    return null;
  }
  return (data as StayWithProfile) ?? null;
}

export async function getNextStay(): Promise<StayWithProfile | null> {
  const today = todayIsoAtLake();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*, profile:profiles(full_name)")
    .gt("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getNextStay:", error);
    return null;
  }
  return (data as StayWithProfile) ?? null;
}

export async function getStayById(id: string): Promise<Stay | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getStayById:", error);
    return null;
  }
  return (data as Stay) ?? null;
}

export async function getUpcomingStays(limit = 12): Promise<StayWithProfile[]> {
  const today = todayIsoAtLake();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stays")
    .select("*, profile:profiles(full_name)")
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingStays:", error);
    return [];
  }
  return (data ?? []) as StayWithProfile[];
}
