import Link from "next/link";
import { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Accounts | TradeTracker",
};

export default async function AccountsPage() {
  const user = await getCurrentUser();

  const accounts =
    user?.id
      ? await prisma.tradingAccount.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const planName = await prisma.subscription
    .findFirst({
      where: {
        userId: user?.id ?? "",
        status: { in: ["TRIALING", "ACTIVE"] },
      },
      include: {
        plan: true,
      },
    })
    .then((subscription) => subscription?.plan.name ?? "Starter")
    .catch(() => "Starter");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Connected accounts</h1>
            <p className="text-sm text-foreground/70">
              Your workspace currently tracks {accounts.length} of your{" "}
              {planName} plan allowance.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/accounts/new"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Connect account
            </Link>
            <Link
              href="/accounts/import"
              className="rounded-full border border-foreground/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/30 bg-background/60 p-6 text-sm text-foreground/60">
            <p>
              You have not connected any broker accounts yet. Start by adding a
              MetaTrader, Interactive Brokers, or Binance connection, or upload
              a CSV exported from your broker.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => {
              const brokerLabel = account.broker;
              const isUrl = brokerLabel?.startsWith("http://") || brokerLabel?.startsWith("https://");

              return (
                <article
                  key={account.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5"
                >
                  <div className="max-w-xl">
                    <h2 className="text-lg font-semibold">{account.name}</h2>
                    <p className="text-xs text-foreground/60">
                      {isUrl ? (
                        <a
                          href={brokerLabel!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          Broker portal
                        </a>
                      ) : brokerLabel ? (
                        brokerLabel
                      ) : (
                        "Manual connection"
                      )}
                      {" · "}
                      {account.connectionType}
                      {" · "}
                      {account.lastSyncedAt
                        ? new Date(account.lastSyncedAt).toLocaleString()
                        : "Never synced"}
                    </p>
                  </div>
                  <Link
                    href={`/accounts/${account.id}`}
                    className="text-sm font-semibold text-foreground hover:text-foreground/80"
                  >
                    View details →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
