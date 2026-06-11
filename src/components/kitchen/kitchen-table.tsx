"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { ACTIONS_BY_STATUS, type KitchenOrder } from "./order-ticket";

type Props = {
  orders: KitchenOrder[];
  onLocalUpdate: (id: string, patch: Partial<KitchenOrder>) => void;
};

const FILTERS: { value: string; label: string; statuses: OrderStatus[] }[] = [
  { value: "active", label: "Active", statuses: ["pending", "confirmed", "preparing", "ready"] },
  { value: "pending", label: "New", statuses: ["pending", "confirmed"] },
  { value: "preparing", label: "Preparing", statuses: ["preparing"] },
  { value: "ready", label: "Ready", statuses: ["ready"] },
  { value: "served", label: "Served", statuses: ["served"] },
  { value: "all", label: "All", statuses: [] },
];

function elapsedColor(createdAt: string, now: number): string {
  const min = (now - new Date(createdAt).getTime()) / 60000;
  if (min > 10) return "text-destructive font-semibold";
  if (min > 5) return "text-warning font-medium";
  return "text-muted-foreground";
}

export function KitchenTable({ orders, onLocalUpdate }: Props) {
  const [filter, setFilter] = useState("active");
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState<number>(() => 0);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
  const rows = orders
    .filter((o) => active.statuses.length === 0 || active.statuses.includes(o.status))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  function advance(o: KitchenOrder, next: OrderStatus) {
    const prev = o.status;
    onLocalUpdate(o.id, { status: next });
    startTransition(async () => {
      const res = await fetch(`/api/orders/${o.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        onLocalUpdate(o.id, { status: prev });
        toast.error("Failed to update");
      }
    });
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="mb-3">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "active")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 backdrop-blur text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Table</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                  No orders
                </td>
              </tr>
            )}
            {rows.map((o) => {
              const action = ACTIONS_BY_STATUS[o.status]?.[0];
              const items = o.order_items.reduce((s, oi) => s + oi.quantity, 0);
              return (
                <tr key={o.id} className="border-t hover:bg-accent/40 transition-colors">
                  <td className={`px-3 py-2.5 whitespace-nowrap ${now ? elapsedColor(o.created_at, now) : "text-muted-foreground"}`}>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(o.created_at)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-bold">{o.table.table_number}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <span className="font-medium text-foreground">{items}</span>
                    {" · "}
                    <span className="truncate">
                      {o.order_items
                        .map((oi) => `${oi.quantity}× ${oi.menu_item.name}`)
                        .join(", ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                    {formatCurrency(Number(o.total))}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {action ? (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => advance(o, action.next)}
                      >
                        {action.label}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
