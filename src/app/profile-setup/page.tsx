import { requireUser } from "@/lib/supabase/auth-helpers";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";

export default async function ProfileSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireUser();
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <span className="mb-4 -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        one more thing
      </span>
      <h1 className="mb-2 text-center font-display text-3xl font-bold text-ink">
        What should we call you?
      </h1>
      <p className="mb-8 text-center text-ink-faint">
        Your name is shown to owners and claimants when you report or claim
        items.
      </p>

      <div className="w-full">
        <ProfileSetupForm next={next ?? "/my-listings"} />
      </div>
    </div>
  );
}
