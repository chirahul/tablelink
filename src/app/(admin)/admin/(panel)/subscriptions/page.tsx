import type { Metadata } from "next";
import { BadgeCheck, Clock, XCircle, IndianRupee } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { getSubscriptionState, recommendPlan, PLANS, type PlanId } from "@/lib/plans";
import { getBillingConfig } from "@/lib/billing-config";
import { SubscriptionsList, type SubRow } from "./subscriptions-list";
import { BillingSettings } from "./billing-settings";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const admin = createAdminClient();

  const [{ data: restaurants }, { data: tables }] = await Promise.all([
    admin
      .from("restaurants")
      .select("id, name, slug, subscription_status, plan, trial_ends_at, subscription_ends_at, created_at")
      .order("created_at", { ascending: false }),
    admin.from("tables").select("restaurant_id"),
  ]);

  const tableCount = new Map<string, number>();
  for (const t of tables ?? []) {
    tableCount.set(t.restaurant_id, (tableCount.get(t.restaurant_id) ?? 0) + 1);
  }

  const rows: SubRow[] = (restaurants ?? []).map((r) => {
    const state = getSubscriptionState(r);
    const tbls = tableCount.get(r.id) ?? 0;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: state.status,
      daysLeft: state.daysLeft,
      endsAt: state.endsAt,
      plan: (r.plan as PlanId | null) ?? null,
      tables: tbls,
      recommended: recommendPlan(tbls),
    };
  });

  const active = rows.filter((r) => r.status === "active").length;
  const trialing = rows.filter((r) => r.status === "trialing").length;
  const expired = rows.filter((r) => r.status === "expired").length;
  const arr = rows
    .filter((r) => r.status === "active" && r.plan && PLANS[r.plan]?.priceYear)
    .reduce((s, r) => s + (PLANS[r.plan as PlanId].priceYear ?? 0), 0);

  const billingConfig = await getBillingConfig();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Activate, extend, or expire restaurant subscriptions after manual (UPI) payment.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active" value={active} icon={<BadgeCheck className="w-4 h-4" />} />
        <StatCard label="On Trial" value={trialing} icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Expired" value={expired} icon={<XCircle className="w-4 h-4" />} />
        <StatCard label="Annual Run-Rate" value={formatCurrency(arr)} icon={<IndianRupee className="w-4 h-4" />} />
      </div>

      <BillingSettings config={billingConfig} />

      <SubscriptionsList rows={rows} />
    </div>
  );
}
