"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderDetailDialog } from "./order-detail-dialog";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  table: { table_number: string } | null;
  order_items: { id: string; quantity: number }[];
};

type Props = {
  orders: OrderRow[];
};

export function OrdersList({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        (o.table as { table_number: string } | null)?.table_number
          ?.toLowerCase()
          .includes(q)
    );
  }, [orders, search]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by order #, customer, or table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {search ? "No orders match your search." : "No orders found."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const itemCount = (o.order_items ?? []).reduce(
              (s, oi) => s + oi.quantity,
              0
            );
            const tableNumber =
              (o.table as { table_number: string } | null)?.table_number ??
              "—";
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="w-full text-left p-4 rounded-2xl border bg-card flex items-center justify-between gap-4 flex-wrap hover:border-foreground/20 hover:shadow-sm active:scale-[0.995] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-bold">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">
                      Table {tableNumber} •{" "}
                      {formatRelativeTime(o.created_at)}
                      {o.customer_name && ` • ${o.customer_name}`}
                    </div>
                  </div>
                  <Badge
                    className={`${ORDER_STATUS_COLORS[o.status] ?? ""} border-0 text-xs`}
                  >
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(Number(o.total))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {itemCount} items •{" "}
                      {o.payment_method === "upi" ? "UPI" : "Counter"}
                      {o.payment_status === "paid" ? " ✓" : ""}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <OrderDetailDialog
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
