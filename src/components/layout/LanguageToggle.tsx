"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions/locale";
import type { Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex overflow-hidden rounded-flyer border-2 border-ink text-xs">
      {(["en", "tr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          disabled={isPending}
          onClick={() => switchTo(code)}
          aria-pressed={locale === code}
          className={cn(
            "px-2 py-1 font-display font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed",
            code === "tr" && "border-l-2 border-ink",
            locale === code ? "bg-mustard text-ink" : "bg-paper text-ink-faint hover:bg-ink/5",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
