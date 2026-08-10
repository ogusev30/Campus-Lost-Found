import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/locale";
import { cn, formatMessage } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/database.types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const { user } = await requireUserWithProfile();
  const { dict } = await getDictionary();
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_leaderboard");
  const rows = (data ?? []) as LeaderboardRow[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.leaderboard.badge}
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink">
        {dict.leaderboard.heading}
      </h1>
      <p className="mb-10 text-ink-faint">{dict.leaderboard.subheading}</p>

      {rows.length === 0 ? (
        <p className="rounded-flyer border-2 border-dashed border-ink/20 p-8 text-center text-ink-faint">
          {dict.leaderboard.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-flyer border-2 border-ink bg-paper-dark shadow-flyer">
          <div className="flex items-center gap-4 border-b-2 border-ink/10 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <span className="w-10">{dict.leaderboard.rankColumn}</span>
            <span className="flex-1">{dict.leaderboard.studentColumn}</span>
            <span>{dict.leaderboard.pointsColumn}</span>
          </div>

          {rows.map((row, index) => {
            const isYou = row.user_id === user.id;
            const rank = index + 1;

            return (
              <div
                key={row.user_id}
                className={cn(
                  "flex items-center gap-4 border-b-2 border-dashed border-ink/10 px-4 py-3 last:border-b-0",
                  isYou && "bg-mustard/15",
                )}
              >
                <span className="w-10 font-display text-lg font-bold text-ink">
                  {MEDALS[index] ?? rank}
                </span>
                <span className="flex-1 font-display font-semibold text-ink">
                  {row.name ?? dict.nav.unnamedUser}
                  {isYou && (
                    <span className="ml-2 font-stamp text-xs uppercase text-mustard-dark">
                      {dict.leaderboard.you}
                    </span>
                  )}
                </span>
                <span className="font-display font-bold text-ink">
                  {formatMessage(dict.leaderboard.pointsValue, { points: row.points })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
