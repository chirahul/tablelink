import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Platform Analytics",
};

type DailyBucket = {
  date: string;
  orders: number;
  revenue: number;
};

export default async function PlatformAnalyticsPage() {
  const admin = createAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - 14);
  since.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: topRestaurants }] = await Promise.all([
    admin
      .from("orders")
      .select("created_at, total, status, restaurant_id")
      .gte("created_at", since.toISOString()),
    admin
      .from("orders")
      .select("restaurant_id, total, restaurant:restaurants(name, slug)")
      .gte("created_at", since.toISOString()),
  ]);

  // Group by day
  const byDay = new Map<string, DailyBucket>();
  for (let d = 0; d < 14; d++) {
    const date = new Date(since);
    date.setDate(date.getDate() + d);
    const key = date.toISOString().slice(0, 10);
    byDay.set(key, { date: key, orders: 0, revenue: 0 });
  }
  for (const o of orders ?? []) {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(o.total);
    }
  }
  const days = Array.from(byDay.values());
  const maxOrders = Math.max(1, ...days.map((d) => d.orders));

  // Top restaurants
  const restaurantStats = new Map<
    string,
    { name: string; slug: string; orders: number; revenue: number }
  >();
  for (const o of topRestaurants ?? []) {
    const r =
      (o.restaurant as unknown as { name: string; slug: string } | null) ??
      null;
    if (!r) continue;
    const existing = restaurantStats.get(o.restaurant_id) ?? {
      name: r.name,
      slug: r.slug,
      orders: 0,
      revenue: 0,
    };
    existing.orders += 1;
    existing.revenue += Number(o.total);
    restaurantStats.set(o.restaurant_id, existing);
  }
  const topList = Array.from(restaurantStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const totalOrders = orders?.length ?? 0;
  const totalRevenue = (orders ?? []).reduce(
    (s, o) => s + Number(o.total),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Platform Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Last 14 days</p>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders (14d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue (14d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Daily orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-1">
            {days.map((d) => {
              const h = (d.orders / maxOrders) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                >
                  <div
                    className="w-full bg-foreground rounded-sm"
                    style={{ height: `${h}%`, minHeight: d.orders ? 2 : 0 }}
                    title={`${d.orders} orders`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{days[0]?.date.slice(5)}</span>
            <span>{days[days.length - 1]?.date.slice(5)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top restaurants by revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {topList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {topList.map((r, i) => (
                <div
                  key={r.slug}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">
                      #{i + 1}
                    </span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(r.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
