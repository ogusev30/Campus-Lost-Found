"use client";

import { useState, useTransition } from "react";
import { acceptClaim, rejectClaim } from "@/lib/actions/claims";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { OwnerClaimView } from "@/lib/types/database.types";

const STATUS_LABEL: Record<OwnerClaimView["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<OwnerClaimView["status"], string> = {
  pending: "text-mustard-dark",
  accepted: "text-ink",
  rejected: "text-brick/70",
};

export function ClaimCard({ claim }: { claim: OwnerClaimView }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-flyer border-2 border-ink/20 bg-paper-dark p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display font-semibold text-ink">
          {claim.claimant_name ?? "Unnamed user"}
        </p>
        <span
          className={cn(
            "font-stamp text-xs uppercase tracking-wide",
            STATUS_CLASS[claim.status],
          )}
        >
          {STATUS_LABEL[claim.status]}
        </span>
      </div>

      <p className="mt-1 text-sm text-ink-faint">&ldquo;{claim.message}&rdquo;</p>

      {claim.status === "accepted" && claim.claimant_email && (
        <p className="mt-2 text-xs text-ink">
          Contact: <span className="font-semibold">{claim.claimant_email}</span>
        </p>
      )}

      {claim.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1 text-xs"
            disabled={isPending}
            onClick={() => run(() => acceptClaim(claim.claim_id))}
          >
            Accept
          </Button>
          <Button
            variant="ghost"
            className="px-3 py-1 text-xs"
            disabled={isPending}
            onClick={() => run(() => rejectClaim(claim.claim_id))}
          >
            Reject
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-brick" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
