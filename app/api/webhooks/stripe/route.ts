import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? "",
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid signature", details: `${error}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await markInvoiceFailed(invoice);
      break;
    }
    default:
      // no-op for unhandled events
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (
    !session.customer ||
    !session.subscription ||
    !session.metadata?.userId ||
    !session.metadata?.planId
  ) {
    return;
  }

  await prisma.subscription.upsert({
    where: { userId: session.metadata.userId },
    update: {
      stripeCustomerId: String(session.customer),
      stripeSubscriptionId: String(session.subscription),
      status: "ACTIVE",
      currentPeriodStart: session.created
        ? new Date(session.created * 1000)
        : undefined,
    },
    create: {
      userId: session.metadata.userId,
      planId: session.metadata.planId,
      stripeCustomerId: String(session.customer),
      stripeSubscriptionId: String(session.subscription),
      status: "ACTIVE",
    },
  });
}

async function syncSubscription(subscription: Stripe.Subscription) {
  if (!subscription.metadata?.userId) {
    return;
  }

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });
}

async function markInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    return;
  }

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: String(invoice.subscription) },
    data: { status: "PAST_DUE" },
  });
}
