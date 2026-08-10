import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

export async function Header() {
  const session = await getCurrentUser();

  return (
    <header className="border-b-2 border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold text-ink">
          Campus Lost <span className="text-brick">&amp;</span> Found
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/browse"
            className="font-display font-semibold text-ink hover:text-brick"
          >
            Browse Items
          </Link>
          <Link
            href="/report"
            className="font-display font-semibold text-ink hover:text-brick"
          >
            Report Item
          </Link>
          {session && (
            <Link
              href="/sent-claims"
              className="font-display font-semibold text-ink hover:text-brick"
            >
              Sent Claims
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-3 border-l-2 border-ink/10 pl-3">
              <div className="leading-tight">
                <p className="font-display font-semibold text-ink">
                  {session.profile?.name ?? "Unnamed user"}
                </p>
                <p className="text-xs text-ink-faint">{session.user.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="px-3 py-1.5 text-xs">
                  Logout
                </Button>
              </form>
            </div>
          ) : (
            <Button href="/login" variant="secondary" className="px-3 py-1.5 text-xs">
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
