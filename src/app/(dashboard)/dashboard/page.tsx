import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeedButton } from "./seed-button";
import { formatCurrency } from "@/lib/format";
import {
  OnboardingWizard,
  type OnboardingStatus,
} from "@/components/dashboard/onboarding-wizard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch restaurant
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();

  // Today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: ordersCount },
    { data: todayOrders },
    { count: tablesCount },
    { count: pendingCount },
    { count: categoriesCount },
    { count: menuItemsCount },
  ] = await Promise.all([
    restaurant
      ? supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", todayStart.toISOString())
      : Promise.resolve({ count: 0 }),
    restaurant
      ? supabase
          .from("orders")
          .select("total")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", todayStart.toISOString())
      : Promise.resolve({ data: [] }),
    restaurant
      ? supabase
          .from("tables")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id)
      : Promise.resolve({ count: 0 }),
    restaurant
      ? supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id)
          .in("status", ["pending", "confirmed", "preparing"])
      : Promise.resolve({ count: 0 }),
    restaurant
      ? supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id)
      : Promise.resolve({ count: 0 }),
    restaurant
      ? supabase
          .from("menu_items")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id)
      : Promise.resolve({ count: 0 }),
  ]);

  const revenueToday = (todayOrders || []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  const onboardingStatus: OnboardingStatus = {
    hasCategories: (categoriesCount ?? 0) > 0,
    hasMenuItems: (menuItemsCount ?? 0) > 0,
    hasTables: (tablesCount ?? 0) > 0,
    menuSlug: restaurant?.slug ?? "",
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            {restaurant?.name ?? "Dashboard"}
          </h1>
          {restaurant && (
            <p className="text-sm text-muted-foreground mt-1">
              Menu URL:{" "}
              <Link
                href={`/menu/${restaurant.slug}`}
                className="underline font-mono"
              >
                /menu/{restaurant.slug}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <SeedButton />
          {restaurant && (
            <Link href={`/menu/${restaurant.slug}`} target="_blank">
              <Button>View Customer Menu</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Onboarding */}
      <OnboardingWizard status={onboardingStatus} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueToday)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tablesCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
