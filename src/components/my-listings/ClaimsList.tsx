import { ClaimCard } from "@/components/my-listings/ClaimCard";
import { formatMessage } from "@/lib/utils";
import type { OwnerClaimView } from "@/lib/types/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ClaimsList({
  claims,
  dict,
}: {
  claims: OwnerClaimView[];
  dict: Dictionary;
}) {
  if (claims.length === 0) {
    return (
      <p className="mt-4 border-t-2 border-dashed border-ink/15 pt-3 text-xs text-ink-faint">
        {dict.myListings.noClaims}
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-t-2 border-dashed border-ink/15 pt-3">
      <p className="font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {formatMessage(dict.myListings.receivedClaims, { count: claims.length })}
      </p>
      {claims.map((claim) => (
        <ClaimCard key={claim.claim_id} claim={claim} dict={dict} />
      ))}
    </div>
  );
}
