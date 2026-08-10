"use client";

import { useActionState, useEffect } from "react";
import { updateItem, type ItemFormState } from "@/lib/actions/items";
import { ItemFormFields } from "@/components/report/ItemFormFields";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/lib/types/database.types";

const initialState: ItemFormState = { error: null, success: false };

export function EditListingForm({
  item,
  onCancel,
}: {
  item: Item;
  onCancel: () => void;
}) {
  const boundUpdateItem = updateItem.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundUpdateItem, initialState);

  useEffect(() => {
    if (state.success) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ItemFormFields defaults={item} />

      {state.error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
