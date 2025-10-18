"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-foreground/70">
          Sign in to access your dashboard, accounts, and analytics.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-foreground/80">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            placeholder="you@example.com"
          />
        </label>

        <label className="block text-sm font-medium text-foreground/80">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-70"
          disabled={pending}
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-center text-xs text-foreground/60">
        <Link href="/reset-password" className="hover:text-foreground">
          Forgot password?
        </Link>
        <span>
          Need an account?{" "}
          <Link href="/signup" className="font-semibold hover:text-foreground">
            Start your free trial
          </Link>
        </span>
      </div>
    </div>
  );
}
