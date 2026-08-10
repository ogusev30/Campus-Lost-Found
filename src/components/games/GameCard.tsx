import { FlyerCard } from "@/components/ui/FlyerCard";
import { Button } from "@/components/ui/Button";
import { formatMessage } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function GameCard({
  id,
  href,
  title,
  description,
  bestScore,
  dict,
}: {
  id: string;
  href: string;
  title: string;
  description: string;
  bestScore: number | null;
  dict: Dictionary["games"];
}) {
  return (
    <FlyerCard id={id}>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-faint">{description}</p>
      <p className="mt-3 font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {bestScore !== null ? formatMessage(dict.bestScore, { score: bestScore }) : dict.notPlayedYet}
      </p>
      <Button href={href} variant="secondary" className="mt-4">
        {dict.playCta}
      </Button>
    </FlyerCard>
  );
}
