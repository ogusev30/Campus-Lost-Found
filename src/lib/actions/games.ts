"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncAchievementUnlocks } from "@/lib/achievements/notify";

export type GameKey = "sort_it" | "memory_cards";

export async function saveGameScore(
  game: GameKey,
  score: number,
): Promise<{ error: string | null; isNewBest: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not logged in.", isNewBest: false };
  }

  const { data: existing } = await supabase
    .from("game_scores")
    .select("best_score")
    .eq("user_id", user.id)
    .eq("game", game)
    .maybeSingle();

  const isNewBest = !existing || score > existing.best_score;

  if (isNewBest) {
    const { error } = await supabase.from("game_scores").upsert(
      {
        user_id: user.id,
        game,
        best_score: score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,game" },
    );

    if (error) return { error: error.message, isNewBest: false };
  }

  await syncAchievementUnlocks(supabase, user.id);

  revalidatePath("/achievements");
  revalidatePath("/games");
  return { error: null, isNewBest };
}
