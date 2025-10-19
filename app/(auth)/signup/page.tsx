"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { getPlanBySlug } from "@/config/plans";

const fallbackTimezones = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Zurich",
  "Europe/Athens",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Kuala_Lumpur",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/St_Johns",
  "America/Caracas",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanSlug = (searchParams.get("plan") as "starter" | "pro") ?? "starter";
  const plan = getPlanBySlug(selectedPlanSlug) ?? getPlanBySlug("starter");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezoneOptions = useMemo(() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      try {
        // @ts-expect-error - supportedValuesOf is available in modern runtimes
        return (Intl.supportedValuesOf("timeZone") as string[]).sort((a, b) =>
          a.localeCompare(b),
        );
      } catch (error) {
        return fallbackTimezones;
      }
    }
    return fallbackTimezones;
  }, []);

  const defaultTimezone = useMemo(() => {
    if (typeof Intl !== "undefined") {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
      } catch (error) {
        return "UTC";
      }
    }
    return "UTC";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      timezone: form.get("timezone"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to create account.");
      }

      const email = payload.email as string;
      const password = payload.password as string;

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (loginResult?.error) {
        throw new Error("Account created but automatic sign-in failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your workspace</h1>
        <p className="text-sm text-foreground/70">
          Start with a 14-day free trial. You selected the {plan?.name} plan.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-foreground/80">
          Name
          <input
            type="text"
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            placeholder="Dani Rivera"
          />
        </label>

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
            minLength={8}
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            placeholder="Create a strong password"
          />
        </label>

        <label className="block text-sm font-medium text-foreground/80">
          Timezone
          <select
            name="timezone"
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            defaultValue={defaultTimezone}
          >
            {timezoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
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
          {pending ? "Creating workspace..." : "Continue"}
        </button>
      </form>

      <div className="text-center text-xs text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:text-foreground">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
