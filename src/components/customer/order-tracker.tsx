"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, ChefHat, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { VegIndicator } from "./veg-indicator";

type OrderItemWithItem = OrderItem & {
  menu_item: { id: string; name: string; is_veg: boolean; image_url: string | null };
};

type FullOrder = Order & {
  order_items: OrderItemWithItem[];
  table: { id: string; table_number: string };
  restaurant: { id: string; name: string; slug: string };
};

type Props = {
  initialOrder: FullOrder;
};

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending", label: "Order Placed", icon: <Clock className="w-4 h-4" /> },
  { status: "confirmed", label: "Confirmed", icon: <Check className="w-4 h-4" /> },
  { status: "preparing", label: "Preparing", icon: <ChefHat className="w-4 h-4" /> },
  { status: "ready", label: "Ready", icon: <Utensils className="w-4 h-4" /> },
  { status: "served", label: "Served", icon: <Check className="w-4 h-4" /> },
];

export function OrderTracker({ initialOrder }: Props) {
  const [order, setOrder] = useState<FullOrder>(initialOrder);
  const supabase = createClient();

  // Subscribe to realtime updates for this order
  useEffect(() => {
    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...(payload.new as Partial<Order>) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id, supabase]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="container max-w-lg mx-auto px-4 py-8 pb-16">
      <div className="text-center mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
        <h1 className="text-4xl font-bold tracking-tight">{order.order_number}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {order.restaurant.name} • Table {order.table.table_number}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Placed {formatRelativeTime(order.created_at)}
        </p>
      </div>

      {/* Status tracker */}
      {isCancelled ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 mb-8">
          <X className="w-5 h-5" />
          <span className="font-semibold">Order cancelled</span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm mb-8">
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.status}
                  className="flex flex-col items-center gap-1.5 z-10 relative bg-transparent px-1"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isDone
                        ? "bg-foreground text-background shadow-lg"
                        : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-[10px] text-center ${
                      isDone ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-foreground -z-0 transition-all duration-500"
              style={{
                width:
                  currentStepIndex >= 0
                    ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="space-y-2 mb-6">
        <h2 className="font-semibold text-sm">Order Details</h2>
        {order.order_items.map((oi) => {
          const addons = (oi.addons as { name: string; price: number }[] | null) ?? [];
          const addonTotal = addons.reduce((s, a) => s + Number(a.price), 0);
          const lineTotal = (Number(oi.unit_price) + addonTotal) * oi.quantity;
          return (
            <div
              key={oi.id}
              className="p-3 rounded-lg border bg-card flex justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <VegIndicator isVeg={oi.menu_item.is_veg} />
                  <span className="font-medium">
                    {oi.quantity} × {oi.menu_item.name}
                  </span>
                </div>
                {oi.variant && (
                  <p className="text-xs text-muted-foreground pl-6">{oi.variant}</p>
                )}
                {addons.length > 0 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    + {addons.map((a) => a.name).join(", ")}
                  </p>
                )}
                {oi.notes && (
                  <p className="text-xs italic text-muted-foreground pl-6">
                    &ldquo;{oi.notes}&rdquo;
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold">
                {formatCurrency(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-1 text-sm mb-6">
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
        <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
          <span>Total</span>
          <span>{formatCurrency(Number(order.total))}</span>
        </div>
        <div className="flex justify-between pt-2 text-xs">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-medium">
            {order.payment_method === "upi" ? "UPI" : "Pay at Counter"} •{" "}
            {order.payment_status === "paid" ? "Paid" : "Pending"}
          </span>
        </div>
      </div>

      <Link href={`/menu/${order.restaurant.slug}?table=${order.table.id}`}>
        <Button variant="outline" className="w-full">
          Order More
        </Button>
      </Link>
    </div>
  );
}
