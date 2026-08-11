"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function LoginForm({ dict }: { dict: Dictionary["login"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/my-listings";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const supabase = createClient();
    const { data, error: authError } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setStatus("error");
      setError(authError.message);
      return;
    }

    if (!data.user) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .single();

    router.push(
      profile?.name ? next : `/profile-setup?next=${encodeURIComponent(next)}`,
    );
    router.refresh();
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

      <label className="flex flex-col gap-1.5 text-left">
        <span className="font-display text-sm font-semibold text-ink">
          {dict.passwordLabel}
        </span>
        <input
          type="password"
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={dict.passwordPlaceholder}
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
        {status === "loading"
          ? mode === "signup"
            ? dict.signingUp
            : dict.signingIn
          : mode === "signup"
            ? dict.signUpButton
            : dict.signInButton}
      </Button>

      <p className="text-center text-sm text-ink-faint">
        {mode === "signup" ? dict.hasAccountPrompt : dict.noAccountPrompt}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
          }}
          className="font-semibold text-ink underline underline-offset-2"
        >
          {mode === "signup" ? dict.switchToSignIn : dict.switchToSignUp}
        </button>
      </p>
    </form>
  );
}
