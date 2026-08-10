import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/types/database.types";

const STATUS_LABEL: Record<ClaimStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<ClaimStatus, string> = {
  pending: "text-mustard-dark",
  accepted: "text-ink",
  rejected: "text-brick/70",
};

export function ClaimStatusLabel({ status }: { status: ClaimStatus }) {
  return (
    <span className={cn("font-stamp text-xs uppercase tracking-wide", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
