// Subscription plans + trial/entitlement logic.
// Pricing: yearly, manual activation (owner pays UPI → admin activates).

export type PlanId = "starter" | "growth" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  priceYear: number | null; // null = custom (Enterprise — contact sales)
  maxTables: number | null; // null = unlimited
  tagline: string;
  features: string[];
}

export const TRIAL_DAYS = 3;
export const SUBSCRIPTION_DAYS = 365;
export const GST_RATE = 0.18; // 18% GST, applied on top of listed (ex-GST) prices

/** Monthly equivalent of a yearly (ex-GST) price, rounded to the rupee. */
export function monthlyPrice(yearly: number): number {
  return Math.round(yearly / 12);
}

/** Yearly price including 18% GST, rounded to the rupee. */
export function yearlyWithGst(yearly: number): number {
  return Math.round(yearly * (1 + GST_RATE));
}

/** Where owners pay for a plan (manual activation). */
export const BILLING_CONTACT = {
  upi: "78795 99093",
  phone: "78795 99093",
  email: "hello@thetablelynk.com",
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceYear: 4999,
    maxTables: 4,
    tagline: "For cafés & small eateries",
    features: [
      "Up to 4 tables",
      "QR ordering & digital menu",
      "Kitchen display system",
      "Orders dashboard & analytics",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceYear: 7999,
    maxTables: 12,
    tagline: "For busy full-service restaurants",
    features: [
      "Up to 12 tables",
      "Everything in Starter",
      "Priority support",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceYear: null,
    maxTables: null,
    tagline: "Multi-outlet & large venues",
    features: [
      "Unlimited tables",
      "Everything in Growth",
      "Custom onboarding",
      "Dedicated support",
    ],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.starter, PLANS.growth, PLANS.enterprise];

/** Suggest the cheapest plan that fits the restaurant's table count. */
export function recommendPlan(tableCount: number): PlanId {
  if (tableCount <= 4) return "starter";
  if (tableCount <= 12) return "growth";
  return "enterprise";
}

export type SubInput = {
  subscription_status?: string | null;
  plan?: string | null;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
};

export type SubStatus = "trialing" | "active" | "expired";

export type SubState = {
  status: SubStatus;
  isLive: boolean; // entitled — menu live & dashboard unlocked
  isTrial: boolean;
  daysLeft: number; // whole days until the active end date (0 when expired)
  endsAt: string | null;
  plan: Plan | null;
};

const DAY = 86_400_000;

/** Single source of truth for whether a restaurant is currently entitled. */
export function getSubscriptionState(r: SubInput, now: number = Date.now()): SubState {
  const trialEnd = r.trial_ends_at ? new Date(r.trial_ends_at).getTime() : 0;
  const subEnd = r.subscription_ends_at ? new Date(r.subscription_ends_at).getTime() : 0;
  const plan = r.plan && r.plan in PLANS ? PLANS[r.plan as PlanId] : null;
  const daysFrom = (t: number) => Math.max(0, Math.ceil((t - now) / DAY));

  if (r.subscription_status === "active" && subEnd > now) {
    return { status: "active", isLive: true, isTrial: false, daysLeft: daysFrom(subEnd), endsAt: r.subscription_ends_at ?? null, plan };
  }
  if ((r.subscription_status === "trialing" || !r.subscription_status) && trialEnd > now) {
    return { status: "trialing", isLive: true, isTrial: true, daysLeft: daysFrom(trialEnd), endsAt: r.trial_ends_at ?? null, plan: null };
  }
  return {
    status: "expired",
    isLive: false,
    isTrial: false,
    daysLeft: 0,
    endsAt: r.subscription_ends_at ?? r.trial_ends_at ?? null,
    plan,
  };
}
