import { ClaimCard } from "@/components/my-listings/ClaimCard";
import type { OwnerClaimView } from "@/lib/types/database.types";

export function ClaimsList({ claims }: { claims: OwnerClaimView[] }) {
  if (claims.length === 0) {
    return (
      <p className="mt-4 border-t-2 border-dashed border-ink/15 pt-3 text-xs text-ink-faint">
        No claims yet.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-t-2 border-dashed border-ink/15 pt-3">
      <p className="font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Received Claims ({claims.length})
      </p>
      {claims.map((claim) => (
        <ClaimCard key={claim.claim_id} claim={claim} />
      ))}
    </div>
  );
}
