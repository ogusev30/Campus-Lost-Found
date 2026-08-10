import { requireUserWithProfile } from "@/lib/supabase/auth-helpers";
import { ReportItemForm } from "@/components/report/ReportItemForm";
import { getDictionary } from "@/lib/i18n/locale";

export default async function ReportItemPage() {
  await requireUserWithProfile();
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <span className="mb-4 inline-block -rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        {dict.report.badge}
      </span>
      <h1 className="mb-2 font-display text-3xl font-bold text-ink">
        {dict.report.heading}
      </h1>
      <p className="mb-8 text-ink-faint">{dict.report.subheading}</p>

      <ReportItemForm
        dict={dict.report}
        categories={dict.categories}
        itemType={dict.itemType}
        errors={dict.errors}
      />
    </div>
  );
}
