import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tradeCount, winningTrades, losingTrades, totalPnL] =
    await Promise.all([
      prisma.trade.count({
        where: { userId: session.user.id },
      }),
      prisma.trade.count({
        where: {
          userId: session.user.id,
          profitLoss: { gt: 0 },
        },
      }),
      prisma.trade.count({
        where: {
          userId: session.user.id,
          profitLoss: { lt: 0 },
        },
      }),
      prisma.trade.aggregate({
        _sum: { profitLoss: true },
        where: { userId: session.user.id },
      }),
    ]);

  const winRate =
    tradeCount === 0 ? 0 : Math.round((winningTrades / tradeCount) * 1000) / 10;

  return NextResponse.json({
    data: {
      tradeCount,
      winningTrades,
      losingTrades,
      winRate,
      profitLossSum: totalPnL._sum.profitLoss?.toNumber?.() ?? 0,
    },
  });
}
