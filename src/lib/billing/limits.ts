import { prisma } from "@/lib/prisma";

export async function getAccountLimit(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
    include: {
      plan: true,
    },
  });

  if (!subscription?.plan) {
    return 2;
  }

  return subscription.plan.maxAccounts;
}

export async function canAddAccount(userId: string) {
  const [limit, count] = await Promise.all([
    getAccountLimit(userId),
    prisma.tradingAccount.count({ where: { userId } }),
  ]);

  return count < limit;
}
