import type { ItemStatus } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ItemStatus, string> = {
  open: "border-ink text-ink bg-transparent",
  claimed: "border-mustard-dark text-mustard-dark bg-mustard/20",
  returned: "border-ink text-paper bg-ink",
  closed: "border-brick text-brick/70 bg-transparent opacity-70",
};

export function StampBadge({ status, label }: { status: ItemStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-3 select-none rounded-flyer border-2 px-2.5 py-0.5",
        "font-stamp text-sm uppercase tracking-wider",
        STATUS_STYLES[status],
      )}
    >
      {label}
    </span>
  );
}
