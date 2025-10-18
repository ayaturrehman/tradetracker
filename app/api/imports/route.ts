import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createImportSchema = z.object({
  tradingAccountId: z.string().cuid().optional(),
  filename: z.string(),
  storageKey: z.string(),
  rowCount: z.number().int().positive().optional(),
  hash: z.string().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const imports = await prisma.importFile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: imports });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = createImportSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const record = await prisma.importFile.create({
    data: {
      userId: session.user.id,
      tradingAccountId: parsed.data.tradingAccountId,
      filename: parsed.data.filename,
      storageKey: parsed.data.storageKey,
      rowCount: parsed.data.rowCount,
      hash: parsed.data.hash,
    },
  });

  await prisma.syncLog.create({
    data: {
      type: "CSV_UPLOAD",
      status: "QUEUED",
      importFileId: record.id,
      tradingAccountId: parsed.data.tradingAccountId,
      message: "Upload received. Awaiting parser.",
    },
  });

  return NextResponse.json({ data: record }, { status: 201 });
}
