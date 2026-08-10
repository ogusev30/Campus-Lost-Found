import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

function NoPhotoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M3 16l4.5-4 3 2.5L15 10l6 6" />
    </svg>
  );
}

export function ItemThumbnail({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-flyer border-2 border-ink/10 bg-paper-dark text-ink-faint/60",
          className,
        )}
      >
        <NoPhotoIcon className="h-1/3 w-1/3" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("flex-shrink-0 rounded-flyer border-2 border-ink/10 object-cover", className)}
    />
  );
}
