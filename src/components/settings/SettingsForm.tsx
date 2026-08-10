"use client";

import { useActionState } from "react";
import { saveProfileName } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function SettingsForm({
  name,
  email,
  dict,
}: {
  name: string;
  email: string;
  dict: Dictionary["settings"];
}) {
  const [state, formAction, pending] = useActionState(saveProfileName, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value="/settings" />

      <label className="flex flex-col gap-1.5">
        <span className="font-display text-sm font-semibold text-ink">
          {dict.nameLabel}
        </span>
        <input
          type="text"
          name="name"
          required
          defaultValue={name}
          className="rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:border-brick"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-display text-sm font-semibold text-ink">
          {dict.emailLabel}
        </span>
        <input
          type="text"
          value={email}
          disabled
          className="rounded-flyer border-2 border-ink/25 bg-paper-dark px-3 py-2 font-body text-ink-faint"
        />
      </label>

      {state.error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? dict.saving : dict.saveChanges}
      </Button>
    </form>
  );
}
