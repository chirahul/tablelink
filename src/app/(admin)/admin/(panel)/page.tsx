import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  CheckCircle2,
  ShoppingBag,
  IndianRupee,
  Eye,
  ScanLine,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { LineChart, BarChart, DonutChart, Sparkline, type DonutSegment } from "@/components/admin/charts";

export const metadata: Metadata = { title: "Super Admin" };

const DAY_MS = 24 * 60 * 60 * 1000;
const inr = (n: number) => n.toLocaleString("en-IN");

const STATUS_COLORS: Record<string, string> = {
  served: "#3f9b54",
  ready: "#2f8fd0",
  preparing: "#B58E3C",
  confirmed: "#c08a3e",
  pending: "#9ca3af",
  cancelled: "#dc2626",
};

function pctDelta(curr: number, prev: number): number {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

export default async function SuperAdminPage() {
  const admin = createAdminClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const since = new Date(todayStart.getTime() - 13 * DAY_MS); // 14-day window

  // 14-day buckets (oldest → newest)
  const buckets = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * DAY_MS);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  });
  const keyIndex = new Map(buckets.map((b, i) => [b.key, i]));
  const todayKey = buckets[13].key;
  const yKey = buckets[12].key;

  const [{ data: restaurants }, { data: orders }, { data: events }, { data: recentOrders }] =
    await Promise.all([
      admin.from("restaurants").select("id, name, address, logo_url, is_active, created_at"),
      admin
        .from("orders")
        .select("created_at, total, status, restaurant_id")
        .gte("created_at", since.toISOString()),
      admin.from("menu_events").select("created_at, source").gte("created_at", since.toISOString()),
      admin
        .from("orders")
        .select("order_number, total, created_at, restaurant:restaurants(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const rs = restaurants ?? [];
  const os = orders ?? [];
  const ev = events ?? [];

  // ---- per-day series (14) ----
  const ordersByDay = new Array(14).fill(0);
  const revenueByDay = new Array(14).fill(0);
  const viewsByDay = new Array(14).fill(0);
  const scansByDay = new Array(14).fill(0);
  const newRestByDay = new Array(14).fill(0);
  const perRest = new Map<string, { name: string; address: string | null; daily: number[]; total: number }>();

  for (const o of os) {
    const i = keyIndex.get(new Date(o.created_at).toISOString().slice(0, 10));
    if (i === undefined) continue;
    ordersByDay[i] += 1;
    if (o.status !== "cancelled") {
      revenueByDay[i] += Number(o.total);
      let r = perRest.get(o.restaurant_id);
      if (!r) {
        const meta = rs.find((x) => x.id === o.restaurant_id);
        r = { name: meta?.name ?? "Unknown", address: meta?.address ?? null, daily: new Array(14).fill(0), total: 0 };
        perRest.set(o.restaurant_id, r);
      }
      r.daily[i] += Number(o.total);
      r.total += Number(o.total);
    }
  }
  for (const e of ev) {
    const i = keyIndex.get(new Date(e.created_at).toISOString().slice(0, 10));
    if (i === undefined) continue;
    viewsByDay[i] += 1;
    if (e.source === "qr") scansByDay[i] += 1;
  }
  for (const r of rs) {
    const i = keyIndex.get(new Date(r.created_at).toISOString().slice(0, 10));
    if (i !== undefined) newRestByDay[i] += 1;
  }

  const last7 = <T,>(a: T[]) => a.slice(7);
  const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
  const labels7 = buckets.slice(7).map((b) => b.label);

  // ---- KPIs ----
  const totalRestaurants = rs.length;
  const activeRestaurants = rs.filter((r) => r.is_active).length;
  const newRest7 = sum(last7(newRestByDay));
  const ti = 13;
  const yi = 12;
  const kpis = [
    { label: "Total Restaurants", value: inr(totalRestaurants), icon: Store, delta: newRest7, deltaText: "from last 7 days", abs: true },
    { label: "Active Restaurants", value: inr(activeRestaurants), icon: CheckCircle2, delta: sum(last7(newRestByDay)), deltaText: "from last 7 days", abs: true },
    { label: "Orders Today", value: inr(ordersByDay[ti]), icon: ShoppingBag, delta: pctDelta(ordersByDay[ti], ordersByDay[yi]), deltaText: "from yesterday" },
    { label: "Revenue Today", value: formatCurrency(revenueByDay[ti]), icon: IndianRupee, delta: pctDelta(revenueByDay[ti], revenueByDay[yi]), deltaText: "from yesterday" },
    { label: "Menu Views Today", value: inr(viewsByDay[ti]), icon: Eye, delta: pctDelta(viewsByDay[ti], viewsByDay[yi]), deltaText: "from yesterday" },
    { label: "QR Scans Today", value: inr(scansByDay[ti]), icon: ScanLine, delta: pctDelta(scansByDay[ti], scansByDay[yi]), deltaText: "from yesterday" },
  ];

  // ---- trend cards ----
  const trends = [
    { title: "Orders", series: last7(ordersByDay), kind: "line" as const, value: inr(sum(last7(ordersByDay))), delta: pctDelta(sum(last7(ordersByDay)), sum(ordersByDay.slice(0, 7))) },
    { title: "Revenue", series: last7(revenueByDay), kind: "line" as const, value: formatCurrency(sum(last7(revenueByDay))), delta: pctDelta(sum(last7(revenueByDay)), sum(revenueByDay.slice(0, 7))) },
    { title: "New Restaurants", series: last7(newRestByDay), kind: "bar" as const, value: inr(sum(last7(newRestByDay))), delta: pctDelta(sum(last7(newRestByDay)), sum(newRestByDay.slice(0, 7))) },
    { title: "QR Scans", series: last7(scansByDay), kind: "line" as const, value: inr(sum(last7(scansByDay))), delta: pctDelta(sum(last7(scansByDay)), sum(scansByDay.slice(0, 7))) },
  ];

  // ---- top restaurants ----
  const topRestaurants = [...perRest.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((r) => ({
      ...r,
      revenue7: sum(r.daily.slice(7)),
      delta: pctDelta(sum(r.daily.slice(7)), sum(r.daily.slice(0, 7))),
      spark: r.daily.slice(7),
    }));

  // ---- orders by status today ----
  const statusCounts = new Map<string, number>();
  for (const o of os) {
    if (new Date(o.created_at).toISOString().slice(0, 10) === todayKey) {
      statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
    }
  }
  const ordersTodayTotal = [...statusCounts.values()].reduce((s, x) => s + x, 0);
  const statusOrder = ["served", "ready", "preparing", "confirmed", "pending", "cancelled"];
  const donutSegments: DonutSegment[] = statusOrder
    .filter((s) => (statusCounts.get(s) ?? 0) > 0)
    .map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: statusCounts.get(s)!, color: STATUS_COLORS[s] }));

  // ---- recent activity ----
  type Act = { icon: typeof Store; label: string; sub: string; time: string };
  const activity: Act[] = [];
  for (const o of recentOrders ?? []) {
    const name = (o.restaurant as unknown as { name: string } | null)?.name ?? "a restaurant";
    activity.push({ icon: Receipt, label: "New order placed", sub: `${o.order_number} from ${name} · ${formatCurrency(Number(o.total))}`, time: o.created_at });
  }
  for (const r of [...rs].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3)) {
    activity.push({ icon: UserPlus, label: "New restaurant registered", sub: r.address ? `${r.name}, ${r.address}` : r.name, time: r.created_at });
  }
  activity.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  const recentActivity = activity.slice(0, 6);

  const todayLabel = todayStart.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Super Admin 👋</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening on TheTableLynk platform today.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 h-10 text-sm">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          {todayLabel}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          const up = k.delta >= 0;
          return (
            <div key={k.label} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{k.label}</div>
                  <div className="text-2xl font-bold tracking-tight leading-tight">{k.value}</div>
                </div>
              </div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${up ? "text-success" : "text-destructive"}`}>
                {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {k.abs ? `${up ? "+" : ""}${inr(Math.round(k.delta))}` : `${up ? "↑" : "↓"} ${Math.abs(k.delta).toFixed(1)}%`}
                <span className="text-muted-foreground font-normal">{k.deltaText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {trends.map((t) => {
          const up = t.delta >= 0;
          return (
            <div key={t.title} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">
                  {t.title} <span className="text-xs font-normal text-muted-foreground">(Last 7 Days)</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-bold tracking-tight">{t.value}</span>
                <span className={`text-xs font-medium ${up ? "text-success" : "text-destructive"}`}>
                  {up ? "↑" : "↓"} {Math.abs(t.delta).toFixed(1)}%
                </span>
              </div>
              {t.kind === "line" ? (
                <LineChart data={t.series} labels={labels7} />
              ) : (
                <BarChart data={t.series} labels={labels7} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent activity */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="/admin/restaurants" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight">{a.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.sub}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{formatRelativeTime(a.time)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top restaurants */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Top Restaurants by Revenue</h2>
            <Link href="/admin/restaurants" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          {topRestaurants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No revenue yet.</p>
          ) : (
            <div className="space-y-3">
              {topRestaurants.map((r, i) => {
                const up = r.delta >= 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.address ?? "—"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{formatCurrency(r.revenue7)}</div>
                      <div className={`text-[11px] font-medium ${up ? "text-success" : "text-destructive"}`}>
                        {up ? "↑" : "↓"} {Math.abs(r.delta).toFixed(1)}%
                      </div>
                    </div>
                    <Sparkline data={r.spark} color={up ? "#3f9b54" : "#dc2626"} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Orders by Status <span className="text-xs font-normal text-muted-foreground">(Today)</span></h2>
          </div>
          {ordersTodayTotal === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No orders yet today.</p>
          ) : (
            <DonutChart segments={donutSegments} centerValue={inr(ordersTodayTotal)} centerLabel="Total" />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/restaurants" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Manage all restaurants <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
