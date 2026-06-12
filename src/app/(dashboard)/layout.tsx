import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { getSubscriptionState, recommendPlan } from "@/lib/plans";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Paywall } from "@/components/dashboard/paywall";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get("sidebar_collapsed")?.value === "1";
  const superAdmin = await isSuperAdmin();

  // Subscription gate for restaurant owners.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(
      "id, subscription_status, plan, trial_ends_at, subscription_ends_at"
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  let trialDaysLeft: number | null = null;
  if (restaurant) {
    const sub = getSubscriptionState(restaurant);
    if (!sub.isLive) {
      const { count } = await supabase
        .from("tables")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id);
      return (
        <Paywall
          endedTrial={restaurant.subscription_status === "trialing" || !restaurant.plan}
          recommended={recommendPlan(count ?? 0)}
        />
      );
    }
    if (sub.isTrial) trialDaysLeft = sub.daysLeft;
  }

  return (
    <DashboardShell
      userEmail={user.email ?? null}
      initialCollapsed={initialCollapsed}
      isSuperAdmin={superAdmin}
      trialDaysLeft={trialDaysLeft}
    >
      {children}
    </DashboardShell>
  );
}
