"use client";

import { useState } from "react";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { StampBadge } from "@/components/ui/StampBadge";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { ListingActions } from "@/components/my-listings/ListingActions";
import { EditListingForm } from "@/components/my-listings/EditListingForm";
import { ClaimsList } from "@/components/my-listings/ClaimsList";
import { MatchBanner } from "@/components/my-listings/MatchBanner";
import { formatItemDate } from "@/lib/utils";
import type { Item, OwnerClaimView } from "@/lib/types/database.types";
import type { MatchDisplay } from "@/lib/matching/getMatchesForItems";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ListingCard({
  item,
  claims,
  match,
  dict,
}: {
  item: Item;
  claims: OwnerClaimView[];
  match: MatchDisplay | null;
  dict: Dictionary;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <FlyerCard id={item.id}>
      {isEditing ? (
        <EditListingForm item={item} onCancel={() => setIsEditing(false)} dict={dict} />
      ) : (
        <>
          <div className="flex gap-4">
            <ItemThumbnail src={item.image_url} alt={item.title} className="h-24 w-24" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-stamp text-xs uppercase tracking-wide text-ink-faint">
                    {dict.itemType[item.type]}
                  </p>
                  <h3 className="font-display text-lg font-bold leading-tight text-ink">
                    {item.title}
                  </h3>
                </div>
                <StampBadge status={item.status} label={dict.itemStatus[item.status]} />
              </div>
              <p className="mt-1 text-sm text-ink-faint">
                {dict.categories[item.category]} · {item.location}
              </p>
              <p className="text-xs text-ink-faint">{formatItemDate(item.item_date)}</p>
            </div>
          </div>

          {match && <MatchBanner match={match} dict={dict} />}

          <ListingActions item={item} onEdit={() => setIsEditing(true)} dict={dict} />

          {item.type === "found" && <ClaimsList claims={claims} dict={dict} />}
        </>
      )}
    </FlyerCard>
  );
}
