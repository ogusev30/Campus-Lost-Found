import type { createClient } from "@/lib/supabase/server";
import type { Item, ItemMatch } from "@/lib/types/database.types";

export interface MatchDisplay {
  matchId: string;
  score: number;
  otherItem: Pick<Item, "id" | "title" | "category" | "location" | "image_url" | "type">;
}

interface PendingMatch {
  matchId: string;
  score: number;
  otherItemId: string;
}

/**
 * For a set of items owned by the caller, returns the best non-dismissed
 * match (if any) for each, keyed by item id. A listing can accumulate more
 * than one item_matches row over time if a better candidate shows up later
 * (findMatches.ts always upserts the current best rather than pruning old
 * rows), so this always picks the highest-scoring surviving one.
 */
export async function getMatchesForOwnedItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingIds: string[],
): Promise<Map<string, MatchDisplay>> {
  const matchesByItem = new Map<string, PendingMatch>();
  if (listingIds.length === 0) return new Map();

  const [{ data: asLost }, { data: asFound }] = await Promise.all([
    supabase.from("item_matches").select("*").in("lost_item_id", listingIds),
    supabase.from("item_matches").select("*").in("found_item_id", listingIds),
  ]);

  const matchRows = [...((asLost ?? []) as ItemMatch[]), ...((asFound ?? []) as ItemMatch[])];
  const otherItemIds = new Set<string>();

  for (const row of matchRows) {
    const isLostSide = listingIds.includes(row.lost_item_id);
    const dismissed = isLostSide ? row.dismissed_by_lost_owner : row.dismissed_by_found_owner;
    if (dismissed) continue;

    const listingId = isLostSide ? row.lost_item_id : row.found_item_id;
    const otherItemId = isLostSide ? row.found_item_id : row.lost_item_id;
    otherItemIds.add(otherItemId);

    const current = matchesByItem.get(listingId);
    if (!current || row.score > current.score) {
      matchesByItem.set(listingId, { matchId: row.id, score: row.score, otherItemId });
    }
  }

  if (otherItemIds.size === 0) return new Map();

  const { data: otherItems } = await supabase
    .from("items")
    .select("id, title, category, location, image_url, type")
    .in("id", Array.from(otherItemIds));

  const otherItemsById = new Map((otherItems ?? []).map((item) => [item.id, item]));

  const result = new Map<string, MatchDisplay>();
  for (const [listingId, match] of matchesByItem) {
    const otherItem = otherItemsById.get(match.otherItemId);
    if (otherItem) {
      result.set(listingId, { matchId: match.matchId, score: match.score, otherItem });
    }
  }
  return result;
}
