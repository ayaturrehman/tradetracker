import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const tradeSchema = z.object({
  tradingAccountId: z.string().cuid(),
  symbol: z.string(),
  side: z.enum(["LONG", "SHORT"]),
  quantity: z.coerce.number().positive(),
  entryPrice: z.coerce.number().positive().optional(),
  exitPrice: z.coerce.number().positive().optional(),
  stopLoss: z.coerce.number().positive().optional(),
  takeProfit: z.coerce.number().positive().optional(),
  fees: z.coerce.number().optional(),
  profitLoss: z.coerce.number().optional(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().optional(),
  source: z.enum(["MANUAL", "CSV", "API"]).default("MANUAL"),
  strategyTag: z.string().optional(),
  notes: z.string().optional(),
  externalId: z.string().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { openedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: trades });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = tradeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const trade = await prisma.trade.create({
    data: {
      userId: session.user.id,
      tradingAccountId: data.tradingAccountId,
      symbol: data.symbol,
      side: data.side,
      quantity: new Prisma.Decimal(data.quantity),
      entryPrice: data.entryPrice ? new Prisma.Decimal(data.entryPrice) : null,
      exitPrice: data.exitPrice ? new Prisma.Decimal(data.exitPrice) : null,
      stopLoss: data.stopLoss ? new Prisma.Decimal(data.stopLoss) : null,
      takeProfit: data.takeProfit ? new Prisma.Decimal(data.takeProfit) : null,
      fees: data.fees ? new Prisma.Decimal(data.fees) : null,
      profitLoss: data.profitLoss ? new Prisma.Decimal(data.profitLoss) : null,
      openedAt: data.openedAt,
      closedAt: data.closedAt ?? null,
      source: data.source,
      strategyTag: data.strategyTag,
      notes: data.notes,
      externalId: data.externalId,
    },
  });

  return NextResponse.json({ data: trade }, { status: 201 });
}
