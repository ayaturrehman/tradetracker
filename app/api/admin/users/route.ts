import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscriptions: {
        include: { plan: true },
      },
      tradingAccounts: true,
    },
  });

  const data = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    activeSubscription: user.subscriptions.find((subscription) =>
      ["ACTIVE", "TRIALING", "PAST_DUE"].includes(subscription.status),
    ),
    accountCount: user.tradingAccounts.length,
  }));

  return NextResponse.json({ data });
}
