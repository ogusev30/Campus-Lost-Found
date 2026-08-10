import Link from "next/link";
import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { getDictionary } from "@/lib/i18n/locale";
import { MemoryCardsGame } from "@/components/games/MemoryCardsGame";

export default async function MemoryCardsPage() {
  await requireUserWithProfile();
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Link
        href="/games"
        className="mb-4 inline-block font-display text-sm font-semibold text-ink-faint hover:text-brick"
      >
        &larr; {dict.games.backToGames}
      </Link>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink">
        {dict.games.memoryCards.title}
      </h1>
      <p className="mb-8 text-ink-faint">{dict.games.memoryCards.instructions}</p>

      <MemoryCardsGame dict={dict.games.memoryCards} shared={dict.games} />
    </div>
  );
}
