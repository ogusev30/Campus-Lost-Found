import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile: profile ?? null };
}

/** Redirects to /login if not signed in. Does not require a saved name. */
export async function requireUser() {
  const result = await getCurrentUser();
  if (!result) redirect("/login");
  return result;
}

/** Redirects to /login if not signed in, or /profile-setup if the name hasn't been saved yet. */
export async function requireUserWithProfile() {
  const result = await requireUser();
  if (!result.profile?.name) redirect("/profile-setup");
  return result as { user: typeof result.user; profile: Profile };
}
