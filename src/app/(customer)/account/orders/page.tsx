"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptText, ChevronRight, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/stores/cart-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { FloatingBottomNav } from "@/components/customer/floating-bottom-nav";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  restaurant: { name: string } | null;
};

export default function AccountOrdersPage() {
  const slug = useCartStore((s) => s.restaurantSlug);
  const tableId = useCartStore((s) => s.tableId);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const { data: rows } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total, created_at, restaurant:restaurants(name)"
        )
        .eq("customer_id", data.user.id)
        .order("created_at", { ascending: false });
      setOrders((rows ?? []) as unknown as OrderRow[]);
    });
  }, []);

  const menuHref = slug
    ? `/menu/${slug}${tableId ? `?table=${tableId}` : ""}`
    : "/";

  if (authed === false) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <ReceiptText className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-xl font-bold mb-2">Sign in to see your orders</h1>
        <p className="text-muted-foreground mb-6">
          Your order history appears here once you order with a phone number.
        </p>
        <Link href={menuHref}>
          <Button size="lg">Back to menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold tracking-tight mb-5">Your orders</h1>

      {orders === null && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="text-center py-16">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-6">No orders yet.</p>
          <Link href={menuHref}>
            <Button size="lg">Browse the menu</Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((o) => (
          <Link
            key={o.id}
            href={`/order/${o.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.99] transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate">
                  {o.restaurant?.name ?? "Order"}
                </span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {o.order_number} · {formatRelativeTime(o.created_at)}
              </p>
            </div>
            <span className="font-bold shrink-0">
              {formatCurrency(Number(o.total))}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>

      <FloatingBottomNav />
    </div>
  );
}
