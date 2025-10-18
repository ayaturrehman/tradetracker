import Link from "next/link";
import { redirect } from "next/navigation";

import { ImportCsvClient } from "./import-client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function ImportCsvPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const accounts = await prisma.tradingAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      broker: true,
    },
  });

  if (accounts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-foreground/10 bg-background p-8 text-center shadow-sm shadow-foreground/5">
          <h1 className="text-3xl font-semibold">No accounts found</h1>
          <p className="mt-3 text-sm text-foreground/70">
            You need at least one trading account before importing trades. Create a broker or
            exchange connection to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/accounts"
              className="rounded-full border border-foreground/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
            >
              Back to accounts
            </Link>
            <Link
              href="/accounts/new"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ImportCsvClient accounts={accounts} />;
}
