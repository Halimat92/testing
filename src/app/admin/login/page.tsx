"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-canvas)] px-6">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-8"
      >
        <h1 className="text-2xl mb-6">Leemah admin</h1>

        <label className="block mb-4">
          <span className="block text-sm mb-1 text-[var(--color-body)]">Email</span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-[10px] border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-rouge)]"
          />
        </label>

        <label className="block mb-6">
          <span className="block text-sm mb-1 text-[var(--color-body)]">Password</span>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-[10px] border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-rouge)]"
          />
        </label>

        {state?.error ? <p className="mb-4 text-sm text-[var(--color-rouge)]">{state.error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[var(--radius-pill)] bg-[var(--color-rouge)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
