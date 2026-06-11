import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  ScanLine,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Analytics",
};

type Props = {
  searchParams: Promise<{ days?: string }>;
};

const PERIODS = [7, 14, 30];

export default async function AnalyticsPage({ searchParams }: Props) {
  const { days: daysRaw } = await searchParams;
  const days = PERIODS.includes(Number(daysRaw)) ? Number(daysRaw) : 14;

  const restaurant = await getCurrentRestaurant();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: items }, { data: events }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, created_at, total, status")
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", since.toISOString()),
      supabase
        .from("order_items")
        .select(
          "quantity, unit_price, menu_item:menu_items(name, is_veg), order:orders!inner(restaurant_id, created_at, status)"
        )
        .eq("order.restaurant_id", restaurant.id)
        .gte("order.created_at", since.toISOString()),
      supabase
        .from("menu_events")
        .select("source")
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", since.toISOString())
        .limit(20000),
    ]);

  const successful = (orders ?? []).filter((o) => o.status !== "cancelled");

  // Daily buckets
  const byDay = new Map<string, { date: string; orders: number; revenue: number }>();
  for (let d = 0; d < days; d++) {
    const date = new Date(since);
    date.setDate(date.getDate() + d);
    byDay.set(date.toISOString().slice(0, 10), {
      date: date.toISOString().slice(0, 10),
      orders: 0,
      revenue: 0,
    });
  }
  for (const o of successful) {
    const b = byDay.get(new Date(o.created_at).toISOString().slice(0, 10));
    if (b) {
      b.orders += 1;
      b.revenue += Number(o.total);
    }
  }
  const daily = Array.from(byDay.values());
  const maxOrders = Math.max(1, ...daily.map((d) => d.orders));

  // Peak hours
  const byHour = new Array(24).fill(0);
  for (const o of successful) byHour[new Date(o.created_at).getHours()] += 1;
  const maxHour = Math.max(1, ...byHour);

  // Popular items
  const itemStats = new Map<
    string,
    { name: string; is_veg: boolean; qty: number; revenue: number }
  >();
  for (const it of items ?? []) {
    const mi = it.menu_item as unknown as { name: string; is_veg: boolean } | null;
    if (!mi) continue;
    const cur = itemStats.get(mi.name) ?? {
      name: mi.name,
      is_veg: mi.is_veg,
      qty: 0,
      revenue: 0,
    };
    cur.qty += it.quantity;
    cur.revenue += Number(it.unit_price) * it.quantity;
    itemStats.set(mi.name, cur);
  }
  const popular = Array.from(itemStats.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
  const maxItemQty = Math.max(1, ...popular.map((p) => p.qty));

  const totalOrders = successful.length;
  const totalRevenue = successful.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const scans = (events ?? []).filter((e) => e.source === "qr").length;
  const views = (events ?? []).length;
  const hasData = totalOrders > 0;

  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted text-sm">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/analytics?days=${p}`}
              className={`px-3 py-1 rounded-full transition-colors ${
                p === days
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}d
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Orders" value={totalOrders} icon={<ShoppingBag className="w-4 h-4" />} />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={<IndianRupee className="w-4 h-4" />} />
        <StatCard label="Avg Order" value={formatCurrency(avgOrderValue)} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="QR Scans" value={scans} icon={<ScanLine className="w-4 h-4" />} />
        <StatCard label="Menu Views" value={views} icon={<Eye className="w-4 h-4" />} />
      </div>

      {/* Daily orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Daily orders</CardTitle>
          <span className="text-xs text-muted-foreground">peak {maxOrders}/day</span>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No orders in the last {days} days yet.
            </p>
          ) : (
            <>
              <div className="flex items-end h-40 gap-1" role="img" aria-label={`Daily orders for the last ${days} days`}>
                {daily.map((d) => (
                  <div
                    key={d.date}
                    className="group relative flex-1 flex flex-col items-center justify-end h-full"
                    title={`${fmtDay(d.date)}: ${d.orders} orders · ${formatCurrency(d.revenue)}`}
                  >
                    {d.orders > 0 && (
                      <span className="text-[10px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.orders}
                      </span>
                    )}
                    <div
                      className="w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-colors"
                      style={{ height: `${(d.orders / maxOrders) * 100}%`, minHeight: d.orders ? 3 : 0 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>{fmtDay(daily[0].date)}</span>
                <span>{fmtDay(daily[Math.floor(daily.length / 2)].date)}</span>
                <span>{fmtDay(daily[daily.length - 1].date)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak hours</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>
            ) : (
              <>
                <div className="flex items-end h-28 gap-0.5" role="img" aria-label="Orders by hour of day">
                  {byHour.map((count, h) => (
                    <div
                      key={h}
                      className="flex-1 flex flex-col justify-end h-full"
                      title={`${h}:00 — ${count} order${count === 1 ? "" : "s"}`}
                    >
                      <div
                        className="w-full bg-primary/80 rounded-t-sm"
                        style={{ height: `${(count / maxHour) * 100}%`, minHeight: count ? 3 : 0 }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>12a</span>
                  <span>6a</span>
                  <span>12p</span>
                  <span>6p</span>
                  <span>11p</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Popular items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popular items</CardTitle>
          </CardHeader>
          <CardContent>
            {popular.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No items sold yet.</p>
            ) : (
              <div className="space-y-2.5">
                {popular.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <VegIndicator isVeg={p.is_veg} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm truncate">{p.name}</span>
                        <span className="text-xs font-semibold shrink-0">{p.qty} sold</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full"
                          style={{ width: `${(p.qty / maxItemQty) * 100}%` }}
                        />
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
