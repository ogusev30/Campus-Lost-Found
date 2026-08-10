"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function dismissMatch(matchId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: match, error: fetchError } = await supabase
    .from("item_matches")
    .select("lost_item_id, found_item_id")
    .eq("id", matchId)
    .single();

  if (fetchError || !match) return { error: "Match not found." };

  const [{ data: lostItem }, { data: foundItem }] = await Promise.all([
    supabase.from("items").select("owner_id").eq("id", match.lost_item_id).single(),
    supabase.from("items").select("owner_id").eq("id", match.found_item_id).single(),
  ]);

  const column =
    lostItem?.owner_id === user.id
      ? "dismissed_by_lost_owner"
      : foundItem?.owner_id === user.id
        ? "dismissed_by_found_owner"
        : null;

  if (!column) return { error: "Not authorized." };

  const { error } = await supabase
    .from("item_matches")
    .update({ [column]: true })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath("/my-listings");
  return { error: null };
}
