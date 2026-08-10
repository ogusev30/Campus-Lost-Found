import type { ItemStatus } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  ItemStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "border-ink text-ink bg-transparent",
  },
  claimed: {
    label: "Claimed",
    className: "border-mustard-dark text-mustard-dark bg-mustard/20",
  },
  returned: {
    label: "Returned",
    className: "border-ink text-paper bg-ink",
  },
  closed: {
    label: "Closed",
    className: "border-brick text-brick/70 bg-transparent opacity-70",
  },
};

export function StampBadge({ status }: { status: ItemStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-block -rotate-3 select-none rounded-flyer border-2 px-2.5 py-0.5",
        "font-stamp text-sm uppercase tracking-wider",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
