import type { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database.types";
import { scoreMatch } from "@/lib/matching/score";

const MATCH_THRESHOLD = 40;

/**
 * Finds the best opposite-type match for `item` and, if it clears the
 * threshold, upserts it into item_matches. Only notifies the reporter on a
 * genuinely new match row, so re-running this for an already-matched item
 * (e.g. on every my-listings load) doesn't spam notifications.
 */
export async function computeMatchesForItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  item: Item,
): Promise<void> {
  const oppositeType = item.type === "lost" ? "found" : "lost";

  const { data: candidates } = await supabase
    .from("items")
    .select("*")
    .eq("type", oppositeType)
    .eq("status", "open")
    .neq("owner_id", item.owner_id);

  if (!candidates || candidates.length === 0) return;

  let best: Item | null = null;
  let bestScore = 0;
  for (const candidate of candidates as Item[]) {
    const score = scoreMatch(item, candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (!best || bestScore < MATCH_THRESHOLD) return;

  const lostItemId = item.type === "lost" ? item.id : best.id;
  const foundItemId = item.type === "lost" ? best.id : item.id;

  const { data: existing } = await supabase
    .from("item_matches")
    .select("id")
    .eq("lost_item_id", lostItemId)
    .eq("found_item_id", foundItemId)
    .maybeSingle();

  if (existing) {
    await supabase.from("item_matches").update({ score: bestScore }).eq("id", existing.id);
    return;
  }

  const { error: insertError } = await supabase.from("item_matches").insert({
    lost_item_id: lostItemId,
    found_item_id: foundItemId,
    score: bestScore,
  });

  if (insertError) return;

  await supabase.from("notifications").insert({
    user_id: item.owner_id,
    type: "match_found",
    payload: {
      itemId: item.id,
      itemTitle: item.title,
      matchedItemId: best.id,
      matchedItemTitle: best.title,
      score: bestScore,
    },
    link: "/my-listings",
  });
}
