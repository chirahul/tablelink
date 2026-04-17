"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";

export type KitchenOrder = Order & {
  order_items: (OrderItem & {
    menu_item: { id: string; name: string; is_veg: boolean };
  })[];
  table: { id: string; table_number: string };
};

type Props = {
  order: KitchenOrder;
  onLocalUpdate?: (id: string, patch: Partial<KitchenOrder>) => void;
};

type Action = {
  label: string;
  next: OrderStatus;
  variant?: "default" | "destructive" | "outline" | "secondary";
};

const ACTIONS_BY_STATUS: Record<OrderStatus, Action[]> = {
  pending: [
    { label: "Accept", next: "confirmed" },
    { label: "Reject", next: "cancelled", variant: "outline" },
  ],
  confirmed: [{ label: "Start preparing", next: "preparing" }],
  preparing: [{ label: "Mark Ready", next: "ready" }],
  ready: [{ label: "Mark Served", next: "served" }],
  served: [],
  cancelled: [],
};

function paymentBadge(method: PaymentMethod, status: PaymentStatus) {
  if (method === "upi") {
    return (
      <Badge
        variant={status === "paid" ? "default" : "outline"}
        className="text-[10px]"
      >
        UPI {status === "paid" ? "✓ Paid" : "• Pending"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px]">
      Counter
    </Badge>
  );
}

export function OrderTicket({ order, onLocalUpdate }: Props) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const actions = ACTIONS_BY_STATUS[order.status] ?? [];

  function updateStatus(next: OrderStatus) {
    // Optimistic update: move the card immediately. If the API call
    // fails, we'll roll back.
    const previous = order.status;
    onLocalUpdate?.(order.id, { status: next });

    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Failed to update");
        // Roll back the optimistic change
        onLocalUpdate?.(order.id, { status: previous });
        return;
      }
      if (next === "cancelled") toast.info(`${order.order_number} cancelled`);
    });
  }

  async function togglePayment() {
    const nextPaymentStatus =
      order.payment_status === "paid" ? "pending" : "paid";
    const previous = order.payment_status;
    onLocalUpdate?.(order.id, { payment_status: nextPaymentStatus });

    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: nextPaymentStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update payment");
        onLocalUpdate?.(order.id, { payment_status: previous });
      }
    });
  }

  const totalItems = order.order_items.reduce((s, oi) => s + oi.quantity, 0);

  return (
    <div
      className={`rounded-2xl border bg-card p-3.5 shadow-sm transition-all duration-300 hover:shadow-md ${
        order.status === "pending" ? "ring-2 ring-yellow-400/60 shadow-yellow-100" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-base leading-tight">
            {order.order_number}
          </div>
          <div className="text-xs text-muted-foreground">
            Table {order.table.table_number}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(order.created_at)}
          </div>
          <button onClick={togglePayment} disabled={isPending} className="cursor-pointer">
            {paymentBadge(order.payment_method, order.payment_status)}
          </button>
        </div>
      </div>

      {/* Items (compact or expanded) */}
      <div className="space-y-1 mb-3">
        {(expanded ? order.order_items : order.order_items.slice(0, 3)).map(
          (oi) => {
            const addons =
              (oi.addons as { name: string; price: number }[] | null) ?? [];
            return (
              <div key={oi.id} className="text-sm">
                <div className="flex items-center gap-1.5">
                  <VegIndicator isVeg={oi.menu_item.is_veg} />
                  <span className="font-medium">{oi.quantity}×</span>
                  <span className="truncate">{oi.menu_item.name}</span>
                  {oi.variant && (
                    <span className="text-xs text-muted-foreground">
                      ({oi.variant})
                    </span>
                  )}
                </div>
                {addons.length > 0 && (
                  <div className="pl-6 text-xs text-muted-foreground">
                    + {addons.map((a) => a.name).join(", ")}
                  </div>
                )}
                {oi.notes && (
                  <div className="pl-6 text-xs italic text-orange-700">
                    &ldquo;{oi.notes}&rdquo;
                  </div>
                )}
              </div>
            );
          }
        )}
        {!expanded && order.order_items.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            + {order.order_items.length - 3} more items
          </button>
        )}
      </div>

      {/* Order-level notes */}
      {order.notes && (
        <div className="text-xs italic bg-orange-50 text-orange-900 p-2 rounded mb-3 border border-orange-200">
          &ldquo;{order.notes}&rdquo;
        </div>
      )}

      {/* Customer */}
      {(order.customer_name || order.customer_phone) && (
        <div className="text-xs text-muted-foreground mb-3">
          {order.customer_name}
          {order.customer_phone && ` • ${order.customer_phone}`}
        </div>
      )}

      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-muted-foreground">{totalItems} items</span>
        <span className="font-semibold">
          {formatCurrency(Number(order.total))}
        </span>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((a) => (
            <Button
              key={a.next}
              size="sm"
              variant={a.variant ?? "default"}
              disabled={isPending}
              onClick={() => updateStatus(a.next)}
              className="flex-1"
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
