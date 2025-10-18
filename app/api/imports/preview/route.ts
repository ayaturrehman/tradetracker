import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { parseTradeCsv } from "@/lib/imports/csv";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  csv: z.string().min(1, "CSV content is required."),
  delimiter: z.string().optional(),
  decimalSeparator: z.enum([".", ","]).optional(),
  previewLimit: z.number().int().positive().max(500).optional(),
  accountId: z.string().cuid(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { csv, delimiter, decimalSeparator, previewLimit, accountId } = parsed.data;

  const account = await prisma.tradingAccount.findFirst({
    where: {
      id: accountId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const result = parseTradeCsv(csv, {
    delimiter,
    decimalSeparator,
    previewLimit,
  });

  const trades = result.trades;

  const externalIdSet = trades
    .map((trade) => trade.externalId)
    .filter((value): value is string => Boolean(value));

  const existingExternalTrades = externalIdSet.length
    ? await prisma.trade.findMany({
        where: {
          tradingAccountId: accountId,
          externalId: { in: externalIdSet },
        },
        select: { externalId: true },
      })
    : [];

  const seenFingerprints = new Set<string>();
  const fingerprint = (trade: typeof trades[number]) =>
    trade.externalId ?? [
      trade.symbol,
      trade.side,
      trade.openedAt.toISOString(),
      trade.entryPrice ?? "",
      trade.quantity ?? "",
    ].join("|");

  existingExternalTrades.forEach((trade) => {
    if (trade.externalId) {
      seenFingerprints.add(trade.externalId);
    }
  });

  const tradesWithoutExternal = trades.filter((trade) => !trade.externalId);

  if (tradesWithoutExternal.length > 0) {
    const openedAtDates = tradesWithoutExternal.map((trade) => trade.openedAt);
    const potentialExisting = await prisma.trade.findMany({
      where: {
        tradingAccountId: accountId,
        openedAt: { in: openedAtDates },
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

    potentialExisting.forEach((trade) => {
      const key = trade.externalId
        ? trade.externalId
        : [
            trade.symbol,
            trade.side,
            trade.openedAt.toISOString(),
            trade.entryPrice?.toString() ?? "",
            trade.quantity?.toString() ?? "",
          ].join("|");
      seenFingerprints.add(key);
    });
  }

  const enhancedTrades = trades.map((trade) => ({
    ...trade,
    alreadyExists: seenFingerprints.has(fingerprint(trade)),
  }));

  return NextResponse.json({
    data: enhancedTrades,
    skipped: result.skipped,
    headerMapping: result.headerMapping,
    unknownHeaders: result.unknownHeaders,
    warnings: result.warnings,
  });
}
