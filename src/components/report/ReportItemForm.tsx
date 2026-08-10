"use client";

import { useActionState } from "react";
import { createItem, type ItemFormState } from "@/lib/actions/items";
import { ItemFormFields } from "@/components/report/ItemFormFields";
import { Button } from "@/components/ui/Button";

const initialState: ItemFormState = { error: null, success: false };

export function ReportItemForm() {
  const [state, formAction, pending] = useActionState(createItem, initialState);

  if (state.success) {
    return (
      <div className="rounded-flyer border-2 border-ink bg-paper-dark p-8 text-center">
        <p className="font-display text-xl font-bold text-ink">
          Listing published!
        </p>
        <p className="mt-2 text-ink-faint">
          Your item is now pinned to the board.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/my-listings" variant="primary">
            View My Listings
          </Button>
          <Button href="/report" variant="ghost">
            Report Another Item
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ItemFormFields />

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
        {pending ? "Publishing..." : "Publish Listing"}
      </Button>
    </form>
  );
}
