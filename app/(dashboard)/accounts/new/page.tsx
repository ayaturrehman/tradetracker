import Link from "next/link";
import { redirect } from "next/navigation";

import { NewAccountForm } from "./new-account-form";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function NewAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [accountCount, subscription] = await Promise.all([
    prisma.tradingAccount.count({ where: { userId: user.id } }),
    prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
      },
      include: {
        plan: true,
      },
    }),
  ]);

  const planLimit = subscription?.plan?.maxAccounts ?? undefined;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Create trading account</h1>
        <p className="text-sm text-foreground/70">
          Add a label for your broker or exchange. Once saved you can import CSVs, connect
          APIs, and schedule syncs.
        </p>
        <Link
          href="/accounts"
          className="text-xs font-semibold text-foreground/60 transition hover:text-foreground"
        >
          ← Back to accounts
        </Link>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
        <NewAccountForm
          accountCount={accountCount}
          planAccountLimit={planLimit}
        />
      </section>
    </div>
  );
}
