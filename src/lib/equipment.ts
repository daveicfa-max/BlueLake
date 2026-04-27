import "server-only";
import { createClient } from "./supabase/server";
import type { Equipment } from "./types";

export async function getEquipment(): Promise<Equipment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.error("getEquipment:", error);
    return [];
  }
  return (data ?? []) as Equipment[];
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getEquipmentById:", error);
    return null;
  }
  return (data as Equipment) ?? null;
}
