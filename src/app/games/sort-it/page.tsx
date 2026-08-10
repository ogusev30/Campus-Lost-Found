import Link from "next/link";
import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { getDictionary } from "@/lib/i18n/locale";
import { SortItGame } from "@/components/games/SortItGame";

export default async function SortItPage() {
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
        {dict.games.sortIt.title}
      </h1>
      <p className="mb-8 text-ink-faint">{dict.games.sortIt.instructions}</p>

      <SortItGame dict={dict.games.sortIt} categories={dict.categories} />
    </div>
  );
}
