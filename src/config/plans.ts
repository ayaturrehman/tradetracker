export type PlanDefinition = {
  slug: "starter" | "pro";
  name: string;
  description: string;
  priceMonthlyCents: number;
  maxAccounts: number;
  stripePriceEnvKey: string;
};

export const PLANS: PlanDefinition[] = [
  {
    slug: "starter",
    name: "Starter",
    description: "Up to 2 connected accounts, manual journal, CSV imports.",
    priceMonthlyCents: 1200,
    maxAccounts: 2,
    stripePriceEnvKey: "STRIPE_PRICE_STARTER",
  },
  {
    slug: "pro",
    name: "Pro",
    description:
      "Manage up to 25 accounts, unlock strategy analytics, automated syncs.",
    priceMonthlyCents: 2900,
    maxAccounts: 25,
    stripePriceEnvKey: "STRIPE_PRICE_PRO",
  },
];

export function getPlanBySlug(slug: PlanDefinition["slug"]) {
  return PLANS.find((plan) => plan.slug === slug) ?? null;
}
