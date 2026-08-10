"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitClaim } from "@/app/items/[id]/actions";
import { Button } from "@/components/ui/Button";

export function ClaimForm({ itemId }: { itemId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (success) {
    return (
      <div className="rounded-flyer border-2 border-ink bg-paper-dark p-4 text-sm text-ink">
        Claim sent. Track its status on{" "}
        <Link href="/sent-claims" className="font-semibold underline">
          Sent Claims
        </Link>
        .
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submitClaim(itemId, message);
          if (result.error) setError(result.error);
          else setSuccess(true);
        });
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-display text-sm font-semibold text-ink">
          Proof of Ownership
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="e.g. The wallet has my blue student ID and two bank cards inside."
          className="rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-brick"
        />
      </label>

      {error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={isPending} className="w-full justify-center">
        {isPending ? "Sending..." : "Send Claim"}
      </Button>
    </form>
  );
}
