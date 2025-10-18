import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const tradeSchema = z.object({
  symbol: z.string(),
  side: z.enum(["LONG", "SHORT"]),
  quantity: z.number().nullable().optional(),
  entryPrice: z.number().nullable().optional(),
  exitPrice: z.number().nullable().optional(),
  stopLoss: z.number().nullable().optional(),
  takeProfit: z.number().nullable().optional(),
  fees: z.number().nullable().optional(),
  profitLoss: z.number().nullable().optional(),
  openedAt: z.string(),
  closedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  strategyTag: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
  source: z.enum(["CSV", "API", "MANUAL"]).optional(),
  raw: z.record(z.string(), z.string()).optional(),
});

const requestSchema = z.object({
  tradingAccountId: z.string().cuid(),
  trades: z.array(tradeSchema).min(1).max(1000),
});

const decimalOrNull = (value?: number | null) =>
  value === null || value === undefined ? null : new Prisma.Decimal(value);

const buildFingerprint = (trade: {
  symbol: string;
  side: string;
  openedAt: Date;
  entryPrice?: number | null;
  quantity?: number | null;
  externalId?: string | null;
}) =>
  trade.externalId ??
  [
    trade.symbol,
    trade.side,
    trade.openedAt.toISOString(),
    trade.entryPrice ?? "",
    trade.quantity ?? "",
  ].join("|");

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { tradingAccountId, trades } = parsed.data;

  const account = await prisma.tradingAccount.findFirst({
    where: {
      id: tradingAccountId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const normalizedTrades = trades.map((trade) => ({
    ...trade,
    openedAt: new Date(trade.openedAt),
    closedAt: trade.closedAt ? new Date(trade.closedAt) : null,
  }));

  const invalidDates = normalizedTrades.find(
    (trade) => Number.isNaN(trade.openedAt.getTime()),
  );

  if (invalidDates) {
    return NextResponse.json(
      { error: "Invalid openedAt date provided." },
      { status: 400 },
    );
  }

  const externalIds = normalizedTrades
    .map((trade) => trade.externalId)
    .filter((value): value is string => Boolean(value));

  const existingExternalTrades = externalIds.length
    ? await prisma.trade.findMany({
        where: {
          tradingAccountId,
          externalId: { in: externalIds },
        },
        select: { externalId: true },
      })
    : [];

  const fingerprints = new Set<string>();

  existingExternalTrades.forEach((trade) => {
    if (trade.externalId) {
      fingerprints.add(trade.externalId);
    }
  });

  const tradesWithoutExternal = normalizedTrades.filter((trade) => !trade.externalId);

  if (tradesWithoutExternal.length > 0) {
    const existingCandidates = await prisma.trade.findMany({
      where: {
        tradingAccountId,
        openedAt: {
          in: tradesWithoutExternal.map((trade) => trade.openedAt),
        },
      },
      select: {
        symbol: true,
        side: true,
        openedAt: true,
        entryPrice: true,
        quantity: true,
        externalId: true,
      },
    });

    existingCandidates.forEach((trade) => {
      const key = trade.externalId
        ? trade.externalId
        : [
            trade.symbol,
            trade.side,
            trade.openedAt.toISOString(),
            trade.entryPrice?.toString() ?? "",
            trade.quantity?.toString() ?? "",
          ].join("|");
      fingerprints.add(key);
    });
  }

  const duplicates: Array<{ fingerprint: string; reason: string }> = [];
  const toInsert: Prisma.TradeCreateManyInput[] = [];

  for (const trade of normalizedTrades) {
    const key = buildFingerprint(trade);

    if (fingerprints.has(key)) {
      duplicates.push({
        fingerprint: key,
        reason: "Trade already exists for this account.",
      });
      continue;
    }

    fingerprints.add(key);

    toInsert.push({
      tradingAccountId,
      userId: session.user.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: decimalOrNull(trade.quantity ?? null),
      entryPrice: decimalOrNull(trade.entryPrice ?? null),
      exitPrice: decimalOrNull(trade.exitPrice ?? null),
      stopLoss: decimalOrNull(trade.stopLoss ?? null),
      takeProfit: decimalOrNull(trade.takeProfit ?? null),
      fees: decimalOrNull(trade.fees ?? null),
      profitLoss: decimalOrNull(trade.profitLoss ?? null),
      openedAt: trade.openedAt,
      closedAt: trade.closedAt ?? undefined,
      source: trade.source ?? "CSV",
      strategyTag: trade.strategyTag ?? undefined,
      notes: trade.notes ?? undefined,
      externalId: trade.externalId ?? undefined,
      meta: trade.raw ? trade.raw : undefined,
    });
  }

  if (toInsert.length > 0) {
    await prisma.trade.createMany({ data: toInsert, skipDuplicates: true });
  }

  return NextResponse.json({
    inserted: toInsert.length,
    skipped: normalizedTrades.length - toInsert.length,
    duplicates: duplicates.length,
  });
}
