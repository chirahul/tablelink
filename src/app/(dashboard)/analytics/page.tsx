import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Analytics",
};

type DailyBucket = {
  date: string;
  orders: number;
  revenue: number;
};

export default async function AnalyticsPage() {
  const restaurant = await getCurrentRestaurant();
  const supabase = await createClient();

  const days = 14;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  // Fetch orders + items for the window
  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, total, status")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", since.toISOString());

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "quantity, unit_price, menu_item:menu_items(name, is_veg), order:orders!inner(id, created_at, restaurant_id, status)"
    )
    .eq("order.restaurant_id", restaurant.id)
    .gte("order.created_at", since.toISOString());

  // Group orders by day
  const byDay = new Map<string, DailyBucket>();
  for (let d = 0; d < days; d++) {
    const date = new Date(since);
    date.setDate(date.getDate() + d);
    const key = date.toISOString().slice(0, 10);
    byDay.set(key, { date: key, orders: 0, revenue: 0 });
  }

  const successfulOrders = (orders ?? []).filter(
    (o) => o.status !== "cancelled"
  );

  for (const o of successfulOrders) {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    const b = byDay.get(key);
    if (b) {
      b.orders += 1;
      b.revenue += Number(o.total);
    }
  }

  const daily = Array.from(byDay.values());
  const maxOrders = Math.max(1, ...daily.map((d) => d.orders));

  // Popular items
  const itemStats = new Map<
    string,
    { name: string; is_veg: boolean; qty: number; revenue: number }
  >();
  for (const it of items ?? []) {
    const menuItem = it.menu_item as unknown as {
      name: string;
      is_veg: boolean;
    } | null;
    if (!menuItem) continue;
    const existing = itemStats.get(menuItem.name) ?? {
      name: menuItem.name,
      is_veg: menuItem.is_veg,
      qty: 0,
      revenue: 0,
    };
    existing.qty += it.quantity;
    existing.revenue += Number(it.unit_price) * it.quantity;
    itemStats.set(menuItem.name, existing);
  }
  const popular = Array.from(itemStats.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Peak hours
  const byHour = new Array(24).fill(0);
  for (const o of successfulOrders) {
    const h = new Date(o.created_at).getHours();
    byHour[h] += 1;
  }
  const maxHour = Math.max(1, ...byHour);

  const totalOrders = successfulOrders.length;
  const totalRevenue = successfulOrders.reduce(
    (s, o) => s + Number(o.total),
    0
  );
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Last {days} days</p>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg order value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(avgOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Daily orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end h-32 gap-1">
            {daily.map((d) => {
              const h = (d.orders / maxOrders) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end"
                  title={`${d.date}: ${d.orders} orders, ${formatCurrency(d.revenue)}`}
                >
                  <div
                    className="w-full bg-foreground rounded-sm"
                    style={{ height: `${h}%`, minHeight: d.orders ? 2 : 0 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{daily[0]?.date.slice(5)}</span>
            <span>{daily[daily.length - 1]?.date.slice(5)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end h-24 gap-0.5">
              {byHour.map((count, h) => (
                <div
                  key={h}
                  className="flex-1 flex flex-col items-center h-full justify-end"
                  title={`${h}:00 — ${count} orders`}
                >
                  <div
                    className="w-full bg-foreground rounded-sm"
                    style={{
                      height: `${(count / maxHour) * 100}%`,
                      minHeight: count ? 2 : 0,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular items</CardTitle>
          </CardHeader>
          <CardContent>
            {popular.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {popular.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-1 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground w-5">
                        #{i + 1}
                      </span>
                      <span className="text-sm truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">
                        {p.qty} sold
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(p.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
