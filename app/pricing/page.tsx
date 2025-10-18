import Link from "next/link";

import { PLANS } from "@/config/plans";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 sm:py-20 lg:py-24">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold">Choose the plan that fits</h1>
        <p className="mx-auto max-w-2xl text-sm text-foreground/70">
          Start with a free 14-day trial. Upgrade or cancel anytime from the
          billing portal. Each plan enforces an account cap automatically.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.slug}
            className="flex h-full flex-col gap-6 rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="text-sm text-foreground/60">{plan.description}</p>
            </div>
            <div className="text-3xl font-semibold">
              {formatCurrency(plan.priceMonthlyCents / 100)}{" "}
              <span className="text-sm font-normal text-foreground/60">
                /month
              </span>
            </div>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>• {plan.maxAccounts} connected accounts</li>
              <li>
                • Unlimited trade history imports with de-duplication and error
                logging
              </li>
              <li>• Advanced analytics, dashboards, and journal exports</li>
            </ul>
            <Link
              href={`/signup?plan=${plan.slug}`}
              className="mt-auto inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Start {plan.name}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
