"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-brick";

export function BrowseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  const type = searchParams.get("type") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce free-text inputs so we don't push a route change per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => updateParam("q", q), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const timeout = setTimeout(() => updateParam("location", location), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title or description..."
        className={cn(inputClass, "w-full")}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-flyer border-2 border-ink">
          {[
            { value: "all", label: "All" },
            { value: "lost", label: "Lost" },
            { value: "found", label: "Found" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateParam("type", t.value)}
              className={cn(
                "px-3 py-1.5 font-display text-sm font-semibold transition-colors",
                type === t.value
                  ? "bg-ink text-paper"
                  : "bg-paper text-ink hover:bg-ink/5",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className={inputClass}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className={cn(inputClass, "w-36")}
        />

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className={cn(inputClass, "ml-auto")}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
