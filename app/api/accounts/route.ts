import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAddAccount } from "@/lib/billing/limits";

const createAccountSchema = z.object({
  name: z.string().min(2),
  broker: z.string().nullable().optional(),
  connectionType: z.enum(["CSV", "API", "MANUAL"]),
  externalAccountId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.tradingAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: accounts });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createAccountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const allowed = await canAddAccount(session.user.id);

  if (!allowed) {
    return NextResponse.json(
      { error: "Plan limit reached. Upgrade to connect more accounts." },
      { status: 403 },
    );
  }

  const account = await prisma.tradingAccount.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      broker: parsed.data.broker ?? null,
      connectionType: parsed.data.connectionType,
      externalAccountId: parsed.data.externalAccountId ?? null,
    },
  });

  return NextResponse.json({ data: account }, { status: 201 });
}