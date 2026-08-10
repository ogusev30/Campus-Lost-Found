import { createClient } from "@/lib/supabase/server";
import type { AchievementStats } from "@/lib/achievements/definitions";

export async function getAchievementStats(userId: string): Promise<AchievementStats> {
  const supabase = await createClient();

  const [
    { count: itemsReported },
    { count: itemsReturned },
    { count: claimsAccepted },
    { data: ownedItems },
  ] = await Promise.all([
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId),
    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("status", "returned"),
    // RLS (claims_select_owner) already scopes this to claims on the
    // caller's own items, so no owner filter is needed here.
    supabase
      .from("claims")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase.from("items").select("type").eq("owner_id", userId),
  ]);

  const types = new Set((ownedItems ?? []).map((item) => item.type));

  return {
    itemsReported: itemsReported ?? 0,
    itemsReturned: itemsReturned ?? 0,
    claimsAccepted: claimsAccepted ?? 0,
    hasLostReport: types.has("lost"),
    hasFoundReport: types.has("found"),
  };
}
