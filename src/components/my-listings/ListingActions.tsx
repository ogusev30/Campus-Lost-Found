"use client";

import { useState, useTransition } from "react";
import { closeItem, deleteItem, markReturned } from "@/lib/actions/items";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/lib/types/database.types";

export function ListingActions({
  item,
  onEdit,
}: {
  item: Item;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canReturn =
    (item.type === "lost" && item.status === "open") ||
    (item.type === "found" && item.status === "claimed");
  const canClose = item.status === "open" || item.status === "claimed";
  const canEdit = item.status !== "returned";

  function runAction(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else setConfirmingDelete(false);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {canEdit && (
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            onClick={onEdit}
            disabled={isPending}
          >
            Edit
          </Button>
        )}

        {canReturn && (
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            disabled={isPending}
            onClick={() => runAction(() => markReturned(item.id))}
          >
            Mark as Returned
          </Button>
        )}

        {canClose && (
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            disabled={isPending}
            onClick={() => runAction(() => closeItem(item.id))}
          >
            Close Listing
          </Button>
        )}

        {!confirmingDelete ? (
          <Button
            variant="danger"
            className="px-3 py-1.5 text-xs"
            disabled={isPending}
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </Button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="font-display text-xs font-semibold text-brick">
              Delete for good?
            </span>
            <Button
              variant="danger"
              className="px-3 py-1 text-xs"
              disabled={isPending}
              onClick={() => runAction(() => deleteItem(item.id))}
            >
              Yes, delete
            </Button>
            <Button
              variant="ghost"
              className="px-3 py-1 text-xs"
              onClick={() => setConfirmingDelete(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
