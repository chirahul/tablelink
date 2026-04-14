"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { UpiQrDisplay } from "@/components/customer/upi-qr-display";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant, Table } from "@/lib/types";

type PaymentChoice = "counter" | "upi";

export default function CartPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((s) => s.items);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const tableId = useCartStore((s) => s.tableId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [payment, setPayment] = useState<PaymentChoice>("counter");

  // Load restaurant and table info
  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();

    supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .maybeSingle()
      .then(({ data }) => setRestaurant(data as Restaurant | null));

    if (tableId) {
      supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .maybeSingle()
        .then(({ data }) => setTable(data as Table | null));
    }
  }, [restaurantId, tableId]);

  const subtotal = getSubtotal();
  const taxRate = restaurant?.settings?.tax_rate ?? 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const menuHref = restaurant
    ? `/menu/${restaurant.slug}${tableId ? `?table=${tableId}` : ""}`
    : "/";

  function handlePlaceOrder() {
    if (!restaurant || !tableId || items.length === 0) {
      toast.error("Missing restaurant or table info.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          table_id: tableId,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          notes: orderNotes || null,
          payment_method: payment,
          items: items.map((i) => ({
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            variant: i.variant?.name ?? null,
            addons: i.addons,
            notes: i.notes || null,
          })),
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error ?? "Failed to place order");
        return;
      }

      toast.success(`Order ${body.order.order_number} placed!`);
      clearCart();
      router.push(`/order/${body.order.id}`);
    });
  }

  if (items.length === 0) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Add items from the menu to get started.
        </p>
        <Link href={menuHref}>
          <Button size="lg">Back to menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-4 pb-28">
      <div className="flex items-center gap-3 mb-6">
        <Link href={menuHref} className="p-2 -ml-2 rounded-md hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Your Cart</h1>
          {restaurant && (
            <p className="text-xs text-muted-foreground">
              {restaurant.name}
              {table ? ` • Table ${table.table_number}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const addonTotal = item.addons.reduce((s, a) => s + a.price, 0);
          const lineTotal = (item.price + addonTotal) * item.quantity;
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border bg-card flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <VegIndicator isVeg={item.is_veg} />
                  <span className="font-semibold">{item.name}</span>
                </div>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">
                    {item.variant.name}
                  </p>
                )}
                {item.addons.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    + {item.addons.map((a) => a.name).join(", ")}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs italic text-muted-foreground mt-1">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 border rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1.5 hover:bg-accent"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1.5 hover:bg-accent"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-semibold text-sm">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive self-start"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Separator className="my-4" />

      {/* Customer info */}
      <div className="space-y-3 mb-6">
        <h2 className="font-semibold text-sm">Your details (optional)</h2>
        <div className="space-y-2">
          <Label htmlFor="customer_name">Name</Label>
          <Input
            id="customer_name"
            placeholder="Your name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order_notes">Special instructions</Label>
          <Textarea
            id="order_notes"
            placeholder="e.g. call when order is ready"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Payment */}
      <div className="space-y-3 mb-6">
        <h2 className="font-semibold text-sm">Payment</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPayment("counter")}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              payment === "counter"
                ? "border-foreground bg-accent"
                : "hover:border-foreground/40"
            }`}
          >
            Pay at Counter
          </button>
          <button
            type="button"
            onClick={() => setPayment("upi")}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              payment === "upi"
                ? "border-foreground bg-accent"
                : "hover:border-foreground/40"
            }`}
          >
            Pay via UPI
          </button>
        </div>

        {payment === "upi" && restaurant && (
          <div className="mt-3">
            <UpiQrDisplay
              upiId={restaurant.upi_id}
              upiQrImageUrl={restaurant.upi_qr_image_url}
              amount={total}
              restaurantName={restaurant.name}
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              After scanning and paying, place the order — the restaurant will
              verify.
            </p>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({taxRate}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Fixed place order button on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t md:static md:p-0 md:mt-6 md:border-0">
        <Button
          size="lg"
          className="w-full"
          disabled={isPending || !restaurant || !tableId}
          onClick={handlePlaceOrder}
        >
          {isPending
            ? "Placing order..."
            : !tableId
              ? "No table selected"
              : `Place Order • ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  );
}
