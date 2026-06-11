import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  Printer,
  ExternalLink,
  QrCode,
  ClipboardList,
  ChefHat,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { OrdersList } from "./orders-list";
import { OrdersFilters } from "./orders-filters";

export const metadata: Metadata = {
  title: "Orders",
};

type Props = {
  searchParams: Promise<{ status?: string; days?: string }>;
};

const STATUS_FILTERS = [
  { label: "Active", value: "active" },
  { label: "All", value: "all" },
  { label: "New", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Served", value: "served" },
  { label: "Cancelled", value: "cancelled" },
];

const DAY_OPTIONS = [
  { d: 1, label: "Today" },
  { d: 7, label: "7d" },
  { d: 30, label: "30d" },
];

export default async function OrdersPage({ searchParams }: Props) {
  const { status = "active", days = "1" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-4">No restaurant found.</p>
      </div>
    );
  }

  const daysNum = Number(days) || 1;
  const since = new Date();
  since.setDate(since.getDate() - daysNum);

  // Counts + summary across the whole range (independent of the status filter).
  const { data: rangeOrders } = await supabase
    .from("orders")
    .select("status, total")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", since.toISOString())
    .limit(1000);

  const all = rangeOrders ?? [];
  const countBy = (pred: (s: string) => boolean) =>
    all.filter((o) => pred(o.status)).length;
  const counts: Record<string, number> = {
    all: all.length,
    active: countBy((s) =>
      ["pending", "confirmed", "preparing", "ready"].includes(s)
    ),
    pending: countBy((s) => s === "pending" || s === "confirmed"),
    preparing: countBy((s) => s === "preparing"),
    ready: countBy((s) => s === "ready"),
    served: countBy((s) => s === "served"),
    cancelled: countBy((s) => s === "cancelled"),
  };
  const revenue = all
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Filtered list query.
  let query = supabase
    .from("orders")
    .select(
      `id, order_number, status, payment_method, payment_status, total, created_at, customer_name, table:tables(table_number), order_items(id, quantity)`
    )
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  if (status === "active") {
    query = query.in("status", ["pending", "confirmed", "preparing", "ready"]);
  } else if (status === "pending") {
    query = query.in("status", ["pending", "confirmed"]);
  } else if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;
  const isEmpty = !orders || orders.length === 0;
  const menuHref = `/menu/${restaurant.slug}`;

  return (
    <div className="space-y-5">
      {/* Title + day range */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success-container px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Ordering System Online
          </span>
        </div>
        <OrdersFilters
          status={status}
          days={daysNum}
          statusOptions={STATUS_FILTERS.map((f) => ({
            ...f,
            count: counts[f.value] ?? 0,
          }))}
          dayOptions={DAY_OPTIONS}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Orders"
          value={counts.pending}
          icon={<ClipboardList className="w-4 h-4" />}
        />
        <StatCard
          label="Preparing"
          value={counts.preparing}
          icon={<ChefHat className="w-4 h-4" />}
        />
        <StatCard
          label="Ready"
          value={counts.ready}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label={daysNum === 1 ? "Revenue Today" : `Revenue (${daysNum}d)`}
          value={formatCurrency(revenue)}
        />
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border bg-card px-6 py-14 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold mb-1.5">
            Your ordering system is live and ready
          </h2>
          <p className="text-muted-foreground max-w-sm mb-2">
            Orders placed from your table QR codes will show up here in
            real time.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Have you printed and placed your QR codes on tables?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/tables">
              <Button size="lg" className="gap-2">
                <Printer className="w-4 h-4" />
                Print QR Codes
              </Button>
            </Link>
            <Link href={menuHref}>
              <Button size="lg" variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View Customer Menu
              </Button>
            </Link>
          </div>
          <Link
            href="/tables"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <QrCode className="w-4 h-4" />
            Manage Tables &amp; QR
          </Link>
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <OrdersList orders={orders as any} />
      )}
    </div>
  );
}
