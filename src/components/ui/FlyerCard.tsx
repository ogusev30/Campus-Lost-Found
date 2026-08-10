import type { ReactNode } from "react";
import { tiltForId } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FlyerCardProps {
  id: string;
  children: ReactNode;
  className?: string;
  pinned?: boolean;
}

export function FlyerCard({ id, children, className, pinned = true }: FlyerCardProps) {
  const tilt = tiltForId(id);

  return (
    <div
      className={cn(
        "group relative bg-paper paper-edge shadow-flyer transition-shadow duration-200 hover:shadow-flyer-hover",
        "rounded-flyer p-5",
        className,
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {pinned && (
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-brick shadow-pin"
        />
      )}
      {children}
    </div>
  );
}
