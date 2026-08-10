import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import type { Dictionary, Locale } from "@/lib/i18n/dictionary";

export async function Header({
  dict,
  locale,
}: {
  dict: Dictionary["nav"];
  locale: Locale;
}) {
  const session = await getCurrentUser();

  return (
    <header className="flex-shrink-0 border-b-2 border-ink/10 bg-paper-dark">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-ink"
        >
          <Logo size={24} />
          Campus Lost <span className="text-brick">&amp;</span> Found
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/browse"
            className="font-display font-semibold text-ink hover:text-brick md:hidden"
          >
            {dict.browseItems}
          </Link>
          <Link
            href="/report"
            className="font-display font-semibold text-ink hover:text-brick md:hidden"
          >
            {dict.reportItem}
          </Link>

          <LanguageToggle locale={locale} />

          {session ? (
            <div className="flex items-center gap-3 border-l-2 border-ink/10 pl-3 md:border-l-0 md:pl-0">
              <div className="leading-tight">
                <p className="font-display font-semibold text-ink">
                  {session.profile?.name ?? dict.unnamedUser}
                </p>
                <p className="text-xs text-ink-faint">{session.user.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
                  {dict.logout}
                </Button>
              </form>
            </div>
          ) : (
            <Button href="/login" variant="secondary" className="px-3 py-1.5 text-xs">
              {dict.login}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
