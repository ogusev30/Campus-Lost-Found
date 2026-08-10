import type { SVGProps } from "react";

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.9 6.06 6.6.72-4.9 4.53 1.28 6.52L12 16.98l-5.88 3.35 1.28-6.52-4.9-4.53 6.6-.72L12 2.5z" />
    </svg>
  );
}

export function StarBadge({ count, title }: { count: number; title?: string }) {
  return (
    <span
      title={title}
      className="flex items-center gap-1 rounded-flyer border-2 border-mustard-dark bg-mustard/20 px-2 py-1 font-display text-xs font-bold text-mustard-dark"
    >
      <StarIcon className="h-3.5 w-3.5" />
      {count}
    </span>
  );
}
