import "server-only";
import { createClient } from "./supabase/server";
import type { ShoppingItemWithProfiles } from "./types";

const ITEM_WITH_PROFILES =
  "*, adder:profiles!shopping_items_added_by_fkey(full_name), picker:profiles!shopping_items_picked_up_by_fkey(full_name)";

export async function getActiveItems(): Promise<ShoppingItemWithProfiles[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select(ITEM_WITH_PROFILES)
    .is("picked_up_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getActiveItems:", error);
    return [];
  }
  return (data ?? []) as ShoppingItemWithProfiles[];
}

export async function getRecentlyPickedUp(
  limit = 20,
): Promise<ShoppingItemWithProfiles[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select(ITEM_WITH_PROFILES)
    .not("picked_up_at", "is", null)
    .order("picked_up_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getRecentlyPickedUp:", error);
    return [];
  }
  return (data ?? []) as ShoppingItemWithProfiles[];
}

export async function getActiveCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("shopping_items")
    .select("id", { count: "exact", head: true })
    .is("picked_up_at", null);
  if (error) {
    console.error("getActiveCount:", error);
    return 0;
  }
  return count ?? 0;
}
