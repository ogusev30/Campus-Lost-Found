import type { SVGProps } from "react";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { formatMessage, cn } from "@/lib/utils";
import type { AchievementResult } from "@/lib/achievements/evaluate";
import type { Dictionary } from "@/lib/i18n/dictionary";

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.9 6.06 6.6.72-4.9 4.53 1.28 6.52L12 16.98l-5.88 3.35 1.28-6.52-4.9-4.53 6.6-.72L12 2.5z" />
    </svg>
  );
}

export function AchievementCard({
  result,
  dict,
}: {
  result: AchievementResult;
  dict: Dictionary["achievements"];
}) {
  const copy = dict.items[result.id];

  return (
    <FlyerCard id={result.id} pinned={result.unlocked}>
      <div className={cn("flex items-start gap-3", !result.unlocked && "opacity-60")}>
        <StarIcon
          className={cn(
            "h-8 w-8 flex-shrink-0",
            result.unlocked ? "text-mustard-dark" : "text-ink-faint",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-ink">{copy.title}</h3>
            {result.unlocked && (
              <span className="-rotate-3 rounded-flyer border-2 border-mustard-dark bg-mustard/20 px-2 py-0.5 font-stamp text-xs uppercase tracking-wider text-mustard-dark">
                {dict.unlocked}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-faint">{copy.description}</p>
          <p className="mt-2 font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {formatMessage(dict.progress, {
              current: result.current,
              threshold: result.threshold,
            })}
          </p>
        </div>
      </div>
    </FlyerCard>
  );
}
