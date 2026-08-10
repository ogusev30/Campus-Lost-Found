"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  lightLabel = "Light",
  darkLabel = "Dark",
}: {
  lightLabel?: string;
  darkLabel?: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Reads DOM state set by the anti-flash inline script in the root
    // layout's <head>; must run post-mount since the server can't know it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function applyTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  return (
    <div className="flex w-fit overflow-hidden rounded-flyer border-2 border-ink">
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-pressed={theme === "light"}
        className={cn(
          "px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
          theme === "light" ? "bg-mustard text-ink" : "bg-paper text-ink-faint hover:bg-ink/5",
        )}
      >
        {lightLabel}
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-pressed={theme === "dark"}
        className={cn(
          "border-l-2 border-ink px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
          theme === "dark" ? "bg-ink text-paper" : "bg-paper text-ink-faint hover:bg-ink/5",
        )}
      >
        {darkLabel}
      </button>
    </div>
  );
}
