import Link from "next/link";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { StampBadge } from "@/components/ui/StampBadge";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { formatItemDate, capitalize } from "@/lib/utils";
import type { Item } from "@/lib/types/database.types";

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <FlyerCard id={item.id} className="h-full transition-transform hover:-translate-y-0.5">
        <ItemThumbnail src={item.image_url} alt={item.title} className="h-40 w-full" />
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-stamp text-xs uppercase tracking-wide text-ink-faint">
              {item.type}
            </p>
            <h3 className="truncate font-display text-lg font-bold leading-tight text-ink">
              {item.title}
            </h3>
          </div>
          <StampBadge status={item.status} label={capitalize(item.status)} />
        </div>
        <p className="mt-1 truncate text-sm text-ink-faint">
          {item.category} · {item.location}
        </p>
        <p className="text-xs text-ink-faint">{formatItemDate(item.item_date)}</p>
      </FlyerCard>
    </Link>
  );
}
