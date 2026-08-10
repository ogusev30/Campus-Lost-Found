"use client";

import { useState, useTransition } from "react";
import { dismissMatch } from "@/lib/actions/matches";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { formatMessage } from "@/lib/utils";
import type { MatchDisplay } from "@/lib/matching/getMatchesForItems";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function MatchBanner({ match, dict }: { match: MatchDisplay; dict: Dictionary }) {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    startTransition(() => {
      dismissMatch(match.matchId);
    });
  }

  return (
    <div className="mt-4 flex gap-3 rounded-flyer border-2 border-mustard-dark bg-mustard/15 p-3">
      <ItemThumbnail
        src={match.otherItem.image_url}
        alt={match.otherItem.title}
        className="h-14 w-14"
      />
      <div className="min-w-0 flex-1">
        <p className="font-stamp text-sm uppercase tracking-wide text-mustard-dark">
          {dict.myListings.matchBanner.title}
        </p>
        <p className="mt-0.5 text-sm text-ink">
          {formatMessage(dict.myListings.matchBanner.subtitle, {
            itemTitle: match.otherItem.title,
            score: match.score,
          })}
        </p>
        <p className="text-xs text-ink-faint">
          {dict.categories[match.otherItem.category]} · {match.otherItem.location}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
          className="mt-1 font-display text-xs font-semibold text-ink-faint underline underline-offset-2 hover:text-brick"
        >
          {dict.myListings.matchBanner.dismissCta}
        </button>
      </div>
    </div>
  );
}
