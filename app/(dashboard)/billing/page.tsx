import Link from "next/link";
import { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Billing | TradeTracker",
};

export default async function BillingPage() {
  const user = await getCurrentUser();

  const subscription = user
    ? await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
        },
        include: { plan: true },
      })
    : null;

  const plan = subscription?.plan ?? {
    name: "Starter",
    monthlyPriceCents: 1200,
    maxAccounts: 2,
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Billing & subscriptions</h1>
        <p className="text-sm text-foreground/70">
          Review your current plan, manage invoices, and update your payment
          method.
        </p>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
        <h2 className="text-lg font-semibold">{plan.name} plan</h2>
        <p className="text-sm text-foreground/60">
          {plan.maxAccounts} connected accounts ·{" "}
          {formatCurrency(plan.monthlyPriceCents / 100)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/billing/portal"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            Open customer portal
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-foreground/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
          >
            Explore plans
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-foreground/20 bg-background/50 p-6 text-sm text-foreground/60">
        <p>
          Stripe webhook events will update subscription status in real time.
          Implement the handler at <code className="rounded bg-foreground/10 px-1">/api/webhooks/stripe</code>{" "}
          to keep this view accurate.
        </p>
      </section>
    </div>
  );
}
