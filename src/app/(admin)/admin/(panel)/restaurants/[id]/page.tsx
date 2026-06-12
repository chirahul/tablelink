import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  IndianRupee,
  UtensilsCrossed,
  QrCode,
  Eye,
  ScanLine,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionState } from "@/lib/plans";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { RestaurantActions } from "./restaurant-actions";
import type { Restaurant } from "@/lib/types";

export const metadata: Metadata = { title: "Restaurant" };

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default async function AdminRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: r } = await admin.from("restaurants").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const restaurant = r as Restaurant;

  const [
    { data: orderRows },
    { count: menuItems },
    { count: tables },
    { count: categories },
    { count: views },
    { count: scans },
    { data: recentOrders },
  ] = await Promise.all([
    admin.from("orders").select("total, status").eq("restaurant_id", id),
    admin.from("menu_items").select("*", { count: "exact", head: true }).eq("restaurant_id", id).is("deleted_at", null),
    admin.from("tables").select("*", { count: "exact", head: true }).eq("restaurant_id", id),
    admin.from("categories").select("*", { count: "exact", head: true }).eq("restaurant_id", id).is("deleted_at", null),
    admin.from("menu_events").select("*", { count: "exact", head: true }).eq("restaurant_id", id),
    admin
      .from("menu_events")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .eq("source", "qr"),
    admin
      .from("orders")
      .select(
        "id, order_number, total, status, created_at, customer_name, table:tables(table_number), order_items(id, quantity)"
      )
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const orders = orderRows ?? [];
  const totalOrders = orders.length;
  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
  const aov = paid.length ? revenue / paid.length : 0;

  // Owner login email (from auth)
  let ownerEmail: string | null = null;
  try {
    const { data: ownerData } = await admin.auth.admin.getUserById(restaurant.owner_id);
    ownerEmail = ownerData.user?.email ?? null;
  } catch {
    ownerEmail = null;
  }

  const joined = new Date(restaurant.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sub = getSubscriptionState(restaurant);
  const subEndDate = sub.endsAt
    ? new Date(sub.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const subText =
    sub.status === "active"
      ? `Subscribed${restaurant.plan ? ` (${restaurant.plan})` : ""} · until ${subEndDate}`
      : sub.status === "trialing"
        ? `Trial — ${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left · ends ${subEndDate}`
        : "Expired — menu offline & owner paywalled";

  const details: { icon: typeof Mail; label: string; value: string | null }[] = [
    { icon: CreditCard, label: "Subscription", value: subText },
    { icon: Mail, label: "Owner login", value: ownerEmail },
    { icon: Mail, label: "Contact email", value: restaurant.email },
    { icon: Phone, label: "Phone", value: restaurant.phone },
    { icon: MapPin, label: "Address", value: restaurant.address },
    { icon: CreditCard, label: "UPI ID", value: restaurant.upi_id },
    { icon: CreditCard, label: "GST", value: restaurant.gst_number },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/restaurants"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> All restaurants
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-card p-5 flex items-center gap-4 flex-wrap">
        {restaurant.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.logo_url} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {restaurant.name[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
            <Badge variant={restaurant.is_active ? "default" : "outline"}>
              {restaurant.is_active ? "Active" : "Suspended"}
            </Badge>
            <Badge
              variant="outline"
              className={
                sub.status === "active"
                  ? "border-success text-success"
                  : sub.status === "trialing"
                    ? "border-primary text-primary"
                    : "border-destructive text-destructive"
              }
            >
              {sub.status === "active"
                ? "Subscribed"
                : sub.status === "trialing"
                  ? `Trial · ${sub.daysLeft}d`
                  : "Expired"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            /menu/{restaurant.slug} · joined {joined}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/menu/${restaurant.slug}`} target="_blank">
            <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border text-sm hover:bg-accent transition-colors">
              <ExternalLink className="w-4 h-4" /> View menu
            </span>
          </Link>
          <RestaurantActions id={restaurant.id} name={restaurant.name} isActive={restaurant.is_active} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Orders" value={totalOrders.toLocaleString("en-IN")} icon={<ShoppingBag className="w-4 h-4" />} />
        <StatCard label="Revenue" value={formatCurrency(revenue)} icon={<IndianRupee className="w-4 h-4" />} />
        <StatCard label="Avg Order" value={formatCurrency(aov)} />
        <StatCard label="Menu Items" value={menuItems ?? 0} sub={`${categories ?? 0} categories`} icon={<UtensilsCrossed className="w-4 h-4" />} />
        <StatCard label="Tables" value={tables ?? 0} icon={<QrCode className="w-4 h-4" />} />
        <StatCard label="Views · QR" value={`${views ?? 0} · ${scans ?? 0}`} icon={<Eye className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-4">
          <h2 className="font-semibold mb-3">Recent Orders</h2>
          {(recentOrders ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y">
              {(recentOrders ?? []).map((o) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const oo = o as any;
                const items = (oo.order_items ?? []).reduce(
                  (s: number, i: { quantity: number }) => s + i.quantity,
                  0
                );
                return (
                  <Link
                    key={oo.id}
                    href={`/admin/orders/${oo.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-accent/40 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{oo.order_number}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {oo.customer_name || "Guest"} · Table {oo.table?.table_number ?? "—"} ·{" "}
                        {items} {items === 1 ? "item" : "items"} · {formatRelativeTime(oo.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={oo.status} />
                      <span className="font-semibold text-sm w-20 text-right">
                        {formatCurrency(Number(oo.total))}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold">Details</h2>
          <div className="space-y-2.5">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="flex items-start gap-2.5 text-sm">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{d.label}</div>
                    <div className="truncate">{d.value || <span className="text-muted-foreground">—</span>}</div>
                  </div>
                </div>
              );
            })}
            {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
              <div className="flex items-start gap-2.5 text-sm pt-1 border-t">
                <Clock className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
                <div className="min-w-0 pt-1">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Hours</div>
                  <div className="space-y-0.5">
                    {DAYS.filter((d) => restaurant.opening_hours[d]).map((d) => (
                      <div key={d} className="flex justify-between gap-4 text-xs">
                        <span className="capitalize text-muted-foreground">{d}</span>
                        <span>
                          {restaurant.opening_hours[d].open} – {restaurant.opening_hours[d].close}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
