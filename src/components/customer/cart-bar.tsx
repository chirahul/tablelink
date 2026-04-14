"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/format";

export function CartBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background border-t md:hidden">
      <Link
        href="/cart"
        className="flex items-center justify-between w-full px-4 py-3 bg-foreground text-background rounded-xl font-medium"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formatCurrency(subtotal)}</span>
          <span className="text-xs opacity-70">View Cart →</span>
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
    <div className="hidden md:block sticky bottom-4 mt-6">
      <Link
        href="/cart"
        className="flex items-center justify-between w-full px-6 py-4 bg-foreground text-background rounded-xl font-medium shadow-lg"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"} — {formatCurrency(subtotal)}
          </span>
        </div>
        <span>View Cart →</span>
      </Link>
    </div>
  );
}
