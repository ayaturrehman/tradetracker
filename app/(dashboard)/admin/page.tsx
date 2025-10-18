import { redirect } from "next/navigation";
import { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin | TradeTracker",
};

export default async function AdminPage() {
  const session = await getCurrentSession();
  const role = session?.user?.role ?? "USER";

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    redirect("/dashboard");
  }

  const [userCount, activeSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: { in: ["TRIALING", "ACTIVE"] } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Admin control center</h1>
        <p className="text-sm text-foreground/70">
          Manage users, plans, and system health. Extend this view with charts
          and filters as the admin API matures.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
          <p className="text-xs uppercase tracking-wide text-foreground/60">
            Total users
          </p>
          <p className="mt-2 text-2xl font-semibold">{userCount}</p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
          <p className="text-xs uppercase tracking-wide text-foreground/60">
            Active subscriptions
          </p>
          <p className="mt-2 text-2xl font-semibold">{activeSubscriptions}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-foreground/20 bg-background/50 p-6 text-sm text-foreground/60">
        <p>
          Replace this placeholder with tables powered by{" "}
          <code className="rounded bg-foreground/10 px-1">/api/admin/users</code>,{" "}
          <code className="rounded bg-foreground/10 px-1">/api/admin/plans</code>, and{" "}
          <code className="rounded bg-foreground/10 px-1">/api/admin/logs</code>.
        </p>
      </section>
    </div>
  );
}
