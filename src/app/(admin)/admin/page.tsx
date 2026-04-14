import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Super Admin",
};

export default async function SuperAdminPage() {
  const admin = createAdminClient();

  // Today's boundary
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalRestaurants },
    { count: activeRestaurants },
    { count: ordersToday },
    { data: revenueTodayRows },
    { count: newSignupsWeek },
    { data: recentOrders },
  ] = await Promise.all([
    admin.from("restaurants").select("*", { count: "exact", head: true }),
    admin
      .from("restaurants")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    admin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    admin
      .from("orders")
      .select("total")
      .gte("created_at", todayStart.toISOString()),
    admin
      .from("restaurants")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    admin
      .from("orders")
      .select(
        "id, order_number, total, status, created_at, restaurant:restaurants(name, slug)"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const revenueToday = (revenueTodayRows ?? []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Across all restaurants on TableLink
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRestaurants ?? 0}</div>
            <div className="text-xs text-muted-foreground">
              {activeRestaurants ?? 0} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersToday ?? 0}</div>
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
              New Signups (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newSignupsWeek ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        <Link
          href="/admin/restaurants"
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          View all restaurants →
        </Link>
      </div>
      {(recentOrders ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center">
          No orders yet across the platform.
        </p>
      ) : (
        <div className="space-y-2">
          {(recentOrders ?? []).map((o) => {
            const restaurantName = (
              o.restaurant as unknown as { name: string } | null
            )?.name ?? "—";
            return (
              <div
                key={o.id}
                className="p-3 rounded-lg border bg-card flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {restaurantName} • {formatRelativeTime(o.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(Number(o.total))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
