"use client";

import { useActionState, useEffect } from "react";
import { updateItem, type ItemFormState } from "@/lib/actions/items";
import { ItemFormFields } from "@/components/report/ItemFormFields";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/lib/types/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

const initialState: ItemFormState = { error: null, success: false };

export function EditListingForm({
  item,
  onCancel,
  dict,
}: {
  item: Item;
  onCancel: () => void;
  dict: Dictionary;
}) {
  const boundUpdateItem = updateItem.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundUpdateItem, initialState);

  useEffect(() => {
    if (state.success) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ItemFormFields
        defaults={item}
        dict={dict.report}
        categories={dict.categories}
        itemType={dict.itemType}
        errors={dict.errors}
      />

      {state.error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? dict.myListings.saving : dict.myListings.saveChanges}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          {dict.myListings.cancel}
        </Button>
      </div>
    </form>
  );
}
