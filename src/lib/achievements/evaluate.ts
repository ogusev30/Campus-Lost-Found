import { ACHIEVEMENTS, type AchievementId, type AchievementStats } from "@/lib/achievements/definitions";

export interface AchievementResult {
  id: AchievementId;
  current: number;
  threshold: number;
  unlocked: boolean;
}

export function evaluateAchievements(stats: AchievementStats) {
  const results: AchievementResult[] = ACHIEVEMENTS.map((def) => {
    const current = def.current(stats);
    return {
      id: def.id,
      current,
      threshold: def.threshold,
      unlocked: current >= def.threshold,
    };
  });

  const stars = results.filter((result) => result.unlocked).length;

  return { results, stars, total: results.length };
}
