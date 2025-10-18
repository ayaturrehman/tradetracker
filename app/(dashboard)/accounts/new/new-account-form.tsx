"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type NewAccountFormProps = {
  accountCount: number;
  planAccountLimit?: number;
};

export function NewAccountForm({ accountCount, planAccountLimit }: NewAccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Account name is required.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          broker: website.trim() ? website.trim() : undefined,
          connectionType: "MANUAL",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to create account. Try again.");
      }

      router.push("/accounts");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setStatus("idle");
    }
  };

  const remaining = planAccountLimit ? planAccountLimit - accountCount : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground/80" htmlFor="name">
          Account name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Interactive Brokers Futures"
          required
          className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground/80" htmlFor="website">
          Website or portal URL (optional)
        </label>
        <input
          id="website"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          type="url"
        />
        <p className="text-xs text-foreground/60">
          Save a link to the broker/exchange dashboard for quick access.
        </p>
      </div>

      {remaining !== null && (
        <p className="text-xs text-foreground/60">
          You have {remaining} of {planAccountLimit} account slots remaining on your plan.
        </p>
      )}

      {errorMessage ? (
        <p className="text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Saving..." : "Save account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setWebsite("");
            setErrorMessage(null);
          }}
          className="inline-flex items-center justify-center rounded-full border border-foreground/30 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
