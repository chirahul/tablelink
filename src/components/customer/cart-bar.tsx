"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/format";

export function CartBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden">
      <Link
        href="/cart"
        className="flex items-center justify-between w-full px-5 py-3.5 bg-foreground text-background rounded-2xl font-medium shadow-2xl active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-background/15 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{formatCurrency(subtotal)}</span>
          <ArrowRight className="w-4 h-4 opacity-60" />
        </div>
      </Link>
    </div>
  );
}

export function DesktopCartBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (itemCount === 0) return null;

  return (
    <div className="hidden md:block sticky bottom-6 mt-8">
      <Link
        href="/cart"
        className="flex items-center justify-between w-full px-6 py-4 bg-foreground text-background rounded-2xl font-medium shadow-2xl hover:shadow-3xl transition-shadow"
      >
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5" />
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"} — {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
}
