import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/locale";
import { GameCard } from "@/components/games/GameCard";

export default async function GamesHubPage() {
  const { user } = await requireUserWithProfile();
  const { dict } = await getDictionary();
  const supabase = await createClient();

  const { data: scores } = await supabase
    .from("game_scores")
    .select("game, best_score")
    .eq("user_id", user.id);

  const bestScores = new Map((scores ?? []).map((row) => [row.game, row.best_score]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.games.hubBadge}
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink">
        {dict.games.hubHeading}
      </h1>
      <p className="mb-10 text-ink-faint">{dict.games.hubSubheading}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <GameCard
          id="sort-it"
          href="/games/sort-it"
          title={dict.games.sortIt.title}
          description={dict.games.sortIt.description}
          bestScore={bestScores.get("sort_it") ?? null}
          dict={dict.games}
        />
        <GameCard
          id="memory-cards"
          href="/games/memory-cards"
          title={dict.games.memoryCards.title}
          description={dict.games.memoryCards.description}
          bestScore={bestScores.get("memory_cards") ?? null}
          dict={dict.games}
        />
      </div>
    </div>
  );
}
