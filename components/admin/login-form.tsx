"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

import { signInAction, type SignInState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignInState = {};

/**
 * Admin sign-in form — email + password, nothing else. No "remember
 * me," no social buttons, no "forgot password" link: this project has
 * exactly one account, created manually in Supabase, so those flows
 * don't exist anywhere in the UI on purpose. Built on React 19's
 * `useActionState` so it degrades gracefully (still a real form POST)
 * if JavaScript fails to load, and shows a pending state / server-
 * returned error without any client-side fetch plumbing.
 */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@jobnestuae.com"
          required
          aria-invalid={Boolean(state.error)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          aria-invalid={Boolean(state.error)}
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
