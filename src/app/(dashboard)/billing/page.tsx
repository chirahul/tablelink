import type { Metadata } from "next";
import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionState, recommendPlan, PLANS } from "@/lib/plans";
import { getBillingConfig } from "@/lib/billing-config";
import { PricingPlans, PaymentInstructions } from "@/components/billing/pricing-plans";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, subscription_status, plan, trial_ends_at, subscription_ends_at")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-4">No restaurant found.</p>
      </div>
    );
  }

  const { count: tableCount } = await supabase
    .from("tables")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const sub = getSubscriptionState(restaurant);
  const recommended = recommendPlan(tableCount ?? 0);
  const billingConfig = await getBillingConfig();
  const endDate = sub.endsAt
    ? new Date(sub.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your TheTableLynk plan.</p>
      </div>

      {/* Status */}
      <div className="rounded-2xl border bg-card p-5 flex items-center gap-4 flex-wrap">
        <span
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            sub.status === "active"
              ? "bg-success-container text-success"
              : sub.status === "trialing"
                ? "bg-primary/10 text-primary"
                : "bg-destructive-container text-destructive"
          }`}
        >
          {sub.status === "active" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : sub.status === "trialing" ? (
            <Clock className="w-6 h-6" />
          ) : (
            <CalendarClock className="w-6 h-6" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            {sub.status === "active"
              ? `${sub.plan ? PLANS[sub.plan.id].name : "Active"} plan`
              : sub.status === "trialing"
                ? "Free trial"
                : "Subscription expired"}
          </div>
          <div className="text-sm text-muted-foreground">
            {sub.status === "active" && endDate && `Renews / expires ${endDate}`}
            {sub.status === "trialing" &&
              `${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left${endDate ? ` · ends ${endDate}` : ""}`}
            {sub.status === "expired" && "Subscribe below to bring your menu back online."}
          </div>
        </div>
        {sub.status === "trialing" && (
          <span className="text-sm font-bold text-primary tabular-nums">{sub.daysLeft}d left</span>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">
          {sub.status === "active" ? "Plans" : "Choose your plan"}
        </h2>
        <PricingPlans recommended={recommended} currentPlan={sub.plan?.id ?? null} />
      </div>

      <PaymentInstructions config={billingConfig} />
    </div>
  );
}
