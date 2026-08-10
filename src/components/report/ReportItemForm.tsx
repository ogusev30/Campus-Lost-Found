"use client";

import { useActionState } from "react";
import { createItem, type ItemFormState } from "@/lib/actions/items";
import { ItemFormFields } from "@/components/report/ItemFormFields";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary";

const initialState: ItemFormState = { error: null, success: false };

export function ReportItemForm({
  dict,
  categories,
  itemType,
  errors,
}: {
  dict: Dictionary["report"];
  categories: Dictionary["categories"];
  itemType: Dictionary["itemType"];
  errors: Dictionary["errors"];
}) {
  const [state, formAction, pending] = useActionState(createItem, initialState);

  if (state.success) {
    return (
      <div className="rounded-flyer border-2 border-ink bg-paper-dark p-8 text-center">
        <p className="font-display text-xl font-bold text-ink">{dict.successTitle}</p>
        <p className="mt-2 text-ink-faint">{dict.successBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/my-listings" variant="primary">
            {dict.viewListingsCta}
          </Button>
          <Button href="/report" variant="ghost">
            {dict.reportAnotherCta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ItemFormFields dict={dict} categories={categories} itemType={itemType} errors={errors} />

      {state.error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={pending}
        className="w-full justify-center"
      >
        {pending ? dict.publishing : dict.publishButton}
      </Button>
    </form>
  );
}
