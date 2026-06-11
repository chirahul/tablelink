"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
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
        o.table?.table_number?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const itemCount = (o: OrderRow) =>
    (o.order_items ?? []).reduce((s, oi) => s + oi.quantity, 0);
  const pay = (o: OrderRow) =>
    `${o.payment_method === "upi" ? "UPI" : "Counter"}${
      o.payment_status === "paid" ? " ✓" : ""
    }`;

  return (
    <>
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
        <>
          {/* Desktop: dense table */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Table</th>
                  <th className="px-4 py-2.5 font-medium">Items</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className="border-t cursor-pointer hover:bg-accent/40 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold">{o.order_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(o.created_at)}
                        {o.customer_name && ` · ${o.customer_name}`}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{o.table?.table_number ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {itemCount(o)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      {formatCurrency(Number(o.total))}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                      {pay(o)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="w-full text-left p-4 rounded-2xl border bg-card flex items-center justify-between gap-4 hover:border-primary/30 active:scale-[0.995] transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Table {o.table?.table_number ?? "—"} ·{" "}
                    {formatRelativeTime(o.created_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">
                    {formatCurrency(Number(o.total))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {itemCount(o)} items · {pay(o)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <OrderDetailDialog orderId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
