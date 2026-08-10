import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { getAchievementStats } from "@/lib/achievements/getStats";
import { evaluateAchievements } from "@/lib/achievements/evaluate";
import { getDictionary } from "@/lib/i18n/locale";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { formatMessage } from "@/lib/utils";

export default async function AchievementsPage() {
  const { user } = await requireUserWithProfile();
  const { dict } = await getDictionary();
  const stats = await getAchievementStats(user.id);
  const { results, stars, total } = evaluateAchievements(stats);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.achievements.badge}
      </span>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {dict.achievements.heading}
          </h1>
          <p className="mt-1 text-ink-faint">{dict.achievements.subheading}</p>
        </div>
        <p className="font-display text-xl font-bold text-mustard-dark">
          {formatMessage(dict.achievements.starsEarned, { count: stars, total })}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {results.map((result) => (
          <AchievementCard key={result.id} result={result} dict={dict.achievements} />
        ))}
      </div>
    </div>
  );
}
