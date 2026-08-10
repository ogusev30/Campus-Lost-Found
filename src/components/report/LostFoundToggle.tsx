"use client";

import { cn } from "@/lib/utils";
import type { ItemType } from "@/lib/types/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function LostFoundToggle({
  value,
  onChange,
  label,
  itemType,
}: {
  value: ItemType;
  onChange: (value: ItemType) => void;
  label: string;
  itemType: Dictionary["itemType"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-sm font-semibold text-ink">{label}</span>
      <div className="flex overflow-hidden rounded-flyer border-2 border-ink">
        {(["lost", "found"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
              value === option
                ? option === "lost"
                  ? "bg-brick text-paper"
                  : "bg-mustard text-ink"
                : "bg-paper text-ink hover:bg-ink/5",
            )}
          >
            {itemType[option]}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={value} />
    </div>
  );
}
