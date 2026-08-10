"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function LoginForm({ dict }: { dict: Dictionary["login"] }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/my-listings";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-flyer border-2 border-ink bg-paper-dark p-6 text-center">
        <p className="font-display font-semibold text-ink">{dict.checkEmailTitle}</p>
        <p className="mt-2 text-sm text-ink-faint">{dict.checkEmailBody(email)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-left">
        <span className="font-display text-sm font-semibold text-ink">
          {dict.emailLabel}
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dict.emailPlaceholder}
          className="rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:border-brick"
        />
      </label>

      {status === "error" && error && (
        <p className="text-sm font-medium text-brick" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={status === "loading"}
        className="w-full justify-center"
      >
        {status === "loading" ? dict.sending : dict.sendButton}
      </Button>
    </form>
  );
}
