import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const { user, profile } = await requireUserWithProfile();

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        settings
      </span>
      <h1 className="mb-8 font-display text-3xl font-bold text-ink">
        Your profile
      </h1>
      <SettingsForm name={profile.name ?? ""} email={user.email ?? ""} />
    </div>
  );
}
