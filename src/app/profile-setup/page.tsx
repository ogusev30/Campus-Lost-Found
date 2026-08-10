import { requireUser } from "@/lib/supabase/auth-helpers";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ProfileSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireUser();
  const { next } = await searchParams;
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <span className="mb-4 -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.profileSetup.badge}
      </span>
      <h1 className="mb-2 text-center font-display text-3xl font-bold text-ink">
        {dict.profileSetup.heading}
      </h1>
      <p className="mb-8 text-center text-ink-faint">{dict.profileSetup.subheading}</p>

      <div className="w-full">
        <ProfileSetupForm next={next ?? "/my-listings"} dict={dict.profileSetup} />
      </div>
    </div>
  );
}
