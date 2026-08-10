import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getDictionary } from "@/lib/i18n/locale";

export default async function SettingsPage() {
  const { user, profile } = await requireUserWithProfile();
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.settings.badge}
      </span>
      <h1 className="mb-8 font-display text-3xl font-bold text-ink">
        {dict.settings.heading}
      </h1>
      <SettingsForm name={profile.name ?? ""} email={user.email ?? ""} dict={dict.settings} />

      <div className="mt-12 border-t-2 border-dashed border-ink/15 pt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          {dict.settings.appearance}
        </h2>
        <ThemeToggle lightLabel={dict.settings.light} darkLabel={dict.settings.dark} />
      </div>
    </div>
  );
}
