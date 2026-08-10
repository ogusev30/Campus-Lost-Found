import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { ReportItemForm } from "@/components/report/ReportItemForm";

export default async function ReportItemPage() {
  await requireUserWithProfile();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        new listing
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink">
        Report an item
      </h1>
      <p className="mb-8 text-ink-faint">
        Lost something, or found something that isn&apos;t yours? Pin it to
        the board.
      </p>

      <ReportItemForm />
    </div>
  );
}
