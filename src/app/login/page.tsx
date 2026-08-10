import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <span className="mb-4 rotate-2 rounded-flyer border-2 border-ink bg-mustard px-3 py-1 font-stamp text-ink">
        sign in
      </span>
      <h1 className="mb-2 text-center font-display text-3xl font-bold text-ink">
        Welcome back to the board
      </h1>
      <p className="mb-8 text-center text-ink-faint">
        No password needed — we&apos;ll email you a magic link.
      </p>

      <div className="w-full">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
