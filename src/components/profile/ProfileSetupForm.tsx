"use client";

import { useActionState } from "react";
import { saveProfileName } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ProfileSetupForm({
  next,
  dict,
}: {
  next: string;
  dict: Dictionary["profileSetup"];
}) {
  const [state, formAction, pending] = useActionState(saveProfileName, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5 text-left">
        <span className="font-display text-sm font-semibold text-ink">
          {dict.nameLabel}
        </span>
        <input
          type="text"
          name="name"
          required
          placeholder={dict.namePlaceholder}
          className="rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:border-brick"
        />
      </label>

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
        {pending ? dict.saving : dict.continueButton}
      </Button>
    </form>
  );
}
