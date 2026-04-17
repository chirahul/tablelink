"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";

type OrderDetail = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  table: { table_number: string };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    variant: string | null;
    addons: { name: string; price: number }[] | null;
    notes: string | null;
    menu_item: { name: string; is_veg: boolean };
  }[];
};

type Props = {
  orderId: string | null;
  onClose: () => void;
};

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending: { label: "Accept", next: "confirmed" },
  confirmed: { label: "Start Preparing", next: "preparing" },
  preparing: { label: "Mark Ready", next: "ready" },
  ready: { label: "Mark Served", next: "served" },
};

export function OrderDetailDialog({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("orders")
      .select(
        `*, order_items(*, menu_item:menu_items(name, is_veg)), table:tables(table_number)`
      )
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as unknown as OrderDetail | null);
        setLoading(false);
      });
  }, [orderId]);

  function updateStatus(next: OrderStatus) {
    if (!order) return;
    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }
      setOrder((prev) => (prev ? { ...prev, status: next } : prev));
      toast.success(`Order ${ORDER_STATUS_LABELS[next] ?? next}`);
    });
  }

  function togglePayment() {
    if (!order) return;
    const next = order.payment_status === "paid" ? "pending" : "paid";
    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: next }),
      });
      if (!res.ok) {
        toast.error("Failed to update payment");
        return;
      }
      setOrder((prev) => (prev ? { ...prev, payment_status: next } : prev));
    });
  }

  const action = order ? NEXT_STATUS[order.status] : null;

  return (
    <Dialog open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !order && (
          <div className="py-8 text-center text-muted-foreground">
            Order not found
          </div>
        )}

        {!loading && order && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">
                  {order.order_number}
                </DialogTitle>
                <Badge
                  className={`${ORDER_STATUS_COLORS[order.status] ?? ""} border-0 text-xs`}
                >
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Table {order.table.table_number} •{" "}
                {formatRelativeTime(order.created_at)}
              </div>
            </DialogHeader>

            {/* Customer info */}
            {(order.customer_name || order.customer_phone) && (
              <div className="text-sm">
                <span className="text-muted-foreground">Customer: </span>
                {order.customer_name}
                {order.customer_phone && ` • ${order.customer_phone}`}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              {order.order_items.map((oi) => {
                const addons = oi.addons ?? [];
                const addonTotal = addons.reduce(
                  (s, a) => s + Number(a.price),
                  0
                );
                const lineTotal =
                  (Number(oi.unit_price) + addonTotal) * oi.quantity;
                return (
                  <div
                    key={oi.id}
                    className="flex justify-between gap-2 py-1"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm">
                        <VegIndicator isVeg={oi.menu_item.is_veg} />
                        <span className="font-medium">
                          {oi.quantity}x {oi.menu_item.name}
                        </span>
                      </div>
                      {oi.variant && (
                        <div className="text-xs text-muted-foreground pl-6">
                          {oi.variant}
                        </div>
                      )}
                      {addons.length > 0 && (
                        <div className="text-xs text-muted-foreground pl-6">
                          + {addons.map((a) => a.name).join(", ")}
                        </div>
                      )}
                      {oi.notes && (
                        <div className="text-xs italic text-orange-700 pl-6">
                          &ldquo;{oi.notes}&rdquo;
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {order.notes && (
              <div className="text-xs bg-orange-50 text-orange-900 p-3 rounded-xl border border-orange-200">
                <span className="font-medium">Note: </span>
                {order.notes}
              </div>
            )}

            <Separator />

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(Number(order.tax))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 flex-wrap">
              <Button
                size="sm"
                variant={
                  order.payment_status === "paid" ? "default" : "outline"
                }
                onClick={togglePayment}
                disabled={isPending}
              >
                {order.payment_status === "paid"
                  ? "Paid"
                  : "Mark as Paid"}
              </Button>
              {action && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(action.next)}
                  disabled={isPending}
                >
                  {action.label}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
