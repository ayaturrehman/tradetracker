import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  timezone: z.string().default("UTC"),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 },
    );
  }

  const hashedPassword = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword,
      timezone: parsed.data.timezone,
      subscriptions: {
        create: {
          status: "TRIALING",
          plan: {
            connectOrCreate: {
              where: { slug: "starter" },
              create: {
                slug: "starter",
                name: "Starter",
                monthlyPriceCents: 1200,
                maxAccounts: 2,
              },
            },
          },
        },
      },
    },
    include: {
      subscriptions: {
        include: { plan: true },
      },
    },
  });

  return NextResponse.json(
    {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscriptions[0] ?? null,
      },
    },
    { status: 201 },
  );
}
