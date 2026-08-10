"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

function navLinkClasses(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-flyer border-2 px-3 py-2 font-display text-sm font-semibold transition-all",
    active
      ? "-rotate-1 border-ink bg-mustard text-ink shadow-flyer"
      : "border-transparent text-ink-faint hover:border-ink/20 hover:text-ink",
  );
}

export function Sidebar({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/browse", label: dict.browseItems, icon: SearchIcon },
    { href: "/report", label: dict.reportItem, icon: PlusCircleIcon },
    { href: "/my-listings", label: dict.myListings, icon: StackIcon },
    { href: "/achievements", label: dict.achievements, icon: StarOutlineIcon },
    { href: "/games", label: dict.games, icon: DiceIcon },
  ];

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col overflow-y-auto border-r-2 border-ink/10 bg-paper-dark md:flex">
      <Link
        href="/"
        className="flex items-center gap-2 border-b-2 border-ink/10 px-5 py-5"
      >
        <Logo size={26} />
        <span className="font-display text-base font-bold leading-tight text-ink">
          Campus
          <br />
          Lost &amp; Found
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={navLinkClasses(pathname === href)}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t-2 border-dashed border-ink/15 px-3 py-4">
        <Link href="/settings" className={navLinkClasses(pathname === "/settings")}>
          <GearIcon className="h-4 w-4 flex-shrink-0" />
          {dict.settings}
        </Link>
      </div>
    </aside>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.3" y2="15.3" />
    </svg>
  );
}

function PlusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function StackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="4" width="17" height="5" rx="1" />
      <rect x="3.5" y="10.5" width="17" height="5" rx="1" />
      <path d="M6 18.5h6" />
    </svg>
  );
}

function StarOutlineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3.5l2.6 5.4 5.9.66-4.35 4.05 1.13 5.9L12 16.85l-5.28 2.66 1.13-5.9-4.35-4.05 5.9-.66L12 3.5z" />
    </svg>
  );
}

function DiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="8.3" cy="8.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="8.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="15.7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="15.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M4.6 7.2l2.1 1.2M17.3 15.6l2.1 1.2M4.6 16.8l2.1-1.2M17.3 8.4l2.1-1.2M3.5 12h2.4M18.1 12h2.4" />
    </svg>
  );
}
