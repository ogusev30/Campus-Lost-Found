import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-ink text-paper border-ink hover:bg-ink-light",
  secondary: "bg-mustard text-ink border-ink hover:bg-mustard-dark",
  ghost: "bg-transparent text-ink border-ink hover:bg-ink/5",
  danger: "bg-brick text-paper border-brick hover:bg-brick-dark",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-flyer border-2 px-4 py-2 " +
  "font-display text-sm font-semibold tracking-wide transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseStyles, VARIANT_STYLES[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
