import { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Super Admin | TradeTracker",
};

export default async function SuperAdminPortal() {
  const session = await getCurrentSession();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const [
    superAdminCount,
    pendingImports,
    activeSyncs,
    planCount,
    latestSyncEvents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.importFile.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.syncLog.count({ where: { status: { in: ["RUNNING", "FAILED"] } } }),
    prisma.plan.count(),
    prisma.syncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        type: true,
        message: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Super admin control center</h1>
        <p className="text-sm text-foreground/70">
          Configure platform-wide settings, monitor ingestion health, and invite additional super
          administrators. Only users with the <code className="rounded bg-foreground/10 px-1">SUPER_ADMIN</code> role can
          access this panel.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Super admins" value={superAdminCount.toString()} detail="Active elevated accounts" />
        <MetricCard label="Plans" value={planCount.toString()} detail="Billing tiers configured" />
        <MetricCard label="Imports in flight" value={pendingImports.toString()} detail="Pending CSV jobs" />
        <MetricCard label="Sync alerts" value={activeSyncs.toString()} detail="Running or failed tasks" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 rounded-3xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <h2 className="text-lg font-semibold">Recent sync events</h2>
          <ul className="space-y-3 text-sm text-foreground/70">
            {latestSyncEvents.length === 0 ? (
              <li className="rounded-2xl border border-foreground/10 bg-background/80 px-3 py-4 text-center text-xs text-foreground/50">
                No sync activity yet.
              </li>
            ) : (
              latestSyncEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-foreground/10 bg-background/90 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{event.type}</p>
                    <p className="text-xs uppercase tracking-wide text-foreground/50">
                      {event.status}
                    </p>
                    {event.message ? (
                      <p className="text-xs text-foreground/60 line-clamp-2">{event.message}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-foreground/50">
                    {format(event.createdAt, "MMM d · HH:mm")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <h2 className="text-lg font-semibold">Super admin onboarding</h2>
          <ol className="space-y-3 text-sm text-foreground/70">
            <li>
              1. Create a user with{" "}
              <code className="rounded bg-foreground/10 px-1 py-0.5">SUPER_ADMIN</code> role via the Prisma
              studio, seed script, or migration.
            </li>
            <li>2. Share credentials securely. Super admins sign in through the standard login form using email + password.</li>
            <li>3. Once authenticated, the navigation will surface the “Super Admin” portal alongside admin tools.</li>
            <li>4. Rotate passwords regularly or integrate SSO by extending the NextAuth configuration.</li>
          </ol>
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-background/60 p-4 text-xs text-foreground/60">
            Tip: use environment variable <code className="rounded bg-foreground/10 px-1">NEXTAUTH_SECRET</code> and strong
            password policies for elevated accounts.
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
      <p className="text-xs uppercase tracking-wide text-foreground/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-foreground/60">{detail}</p>
    </div>
  );
}
