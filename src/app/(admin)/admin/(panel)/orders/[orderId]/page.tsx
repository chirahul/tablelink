import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, Armchair, StickyNote } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Order" };

type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  table: { table_number: string } | null;
  restaurant: { id: string; name: string; slug: string } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    variant: string | null;
    addons: { name: string; price: number }[] | null;
    notes: string | null;
    menu_item: { name: string; is_veg: boolean } | null;
  }[];
};

function VegDot({ veg }: { veg: boolean }) {
  return (
    <span
      className={`inline-flex w-3.5 h-3.5 border rounded-[3px] items-center justify-center shrink-0 ${
        veg ? "border-success" : "border-destructive"
      }`}
      aria-label={veg ? "Veg" : "Non-veg"}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-success" : "bg-destructive"}`} />
    </span>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("orders")
    .select(
      `*, order_items(*, menu_item:menu_items(name, is_veg)), table:tables(table_number), restaurant:restaurants(id, name, slug)`
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!data) notFound();
  const order = data as unknown as OrderDetail;
  const items = order.order_items ?? [];

  const payment = `${order.payment_method === "upi" ? "UPI" : order.payment_method === "counter" ? "Counter" : order.payment_method}${
    order.payment_status === "paid" ? " · Paid" : " · " + order.payment_status
  }`;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link
        href={order.restaurant ? `/admin/restaurants/${order.restaurant.id}` : "/admin/restaurants"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {order.restaurant ? order.restaurant.name : "Restaurants"}
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatRelativeTime(order.created_at)}
              {order.restaurant && (
                <>
                  {" · "}
                  <Link href={`/menu/${order.restaurant.slug}`} target="_blank" className="hover:underline">
                    {order.restaurant.name}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(Number(order.total))}</div>
            <div className="text-xs text-muted-foreground">{payment}</div>
          </div>
        </div>

        {/* Who */}
        <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{order.customer_name || "Guest"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{order.customer_phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Armchair className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Table {order.table?.table_number ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* What */}
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold mb-3">
          Items <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
        </h2>
        <div className="divide-y">
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-3 py-3">
              <span className="text-sm font-semibold text-muted-foreground w-7 shrink-0">
                {it.quantity}×
              </span>
              {it.menu_item && <span className="mt-0.5"><VegDot veg={it.menu_item.is_veg} /></span>}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{it.menu_item?.name ?? "Item"}</div>
                {it.variant && (
                  <div className="text-xs text-muted-foreground">{it.variant}</div>
                )}
                {it.addons && it.addons.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    + {it.addons.map((a) => `${a.name}${a.price ? ` (${formatCurrency(a.price)})` : ""}`).join(", ")}
                  </div>
                )}
                {it.notes && (
                  <div className="text-xs text-muted-foreground italic flex items-center gap-1 mt-0.5">
                    <StickyNote className="w-3 h-3" /> {it.notes}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">
                  {formatCurrency(Number(it.unit_price) * it.quantity)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {formatCurrency(Number(it.unit_price))} ea
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t space-y-1.5 text-sm ml-auto max-w-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          {Number(order.tax) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(Number(order.tax))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1.5 border-t">
            <span>Total</span>
            <span>{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl border bg-card p-4 text-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Order note</div>
          {order.notes}
        </div>
      )}
    </div>
  );
}
