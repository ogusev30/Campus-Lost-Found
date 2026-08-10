import type { createClient } from "@/lib/supabase/server";
import { getAchievementStats } from "@/lib/achievements/getStats";
import { evaluateAchievements } from "@/lib/achievements/evaluate";

/**
 * Diffs currently-unlocked achievements against the persisted
 * achievement_unlocks table and notifies the user once per newly-crossed
 * threshold. Achievements themselves are always recomputed on the fly (see
 * evaluate.ts), so this insert-only table is only there to tell "just
 * unlocked" apart from "already had it" for notification purposes.
 */
export async function syncAchievementUnlocks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<void> {
  const stats = await getAchievementStats(userId);
  const { results } = evaluateAchievements(stats);
  const unlockedIds = results.filter((result) => result.unlocked).map((result) => result.id);

  for (const achievementId of unlockedIds) {
    const { data, error } = await supabase
      .from("achievement_unlocks")
      .insert({ user_id: userId, achievement_id: achievementId })
      .select("achievement_id")
      .maybeSingle();

    if (error || !data) continue;

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "achievement_unlocked",
      payload: { achievementId },
      link: "/achievements",
    });
  }
}
