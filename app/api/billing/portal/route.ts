import { NextResponse } from "next/server";
import Stripe from "stripe";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer configured" },
      { status: 404 },
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: process.env.NEXTAUTH_URL ?? "http://localhost:3000/billing",
  });

  return NextResponse.json({ url: portalSession.url });
}
