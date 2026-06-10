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
    <div className="fixed bottom-24 left-0 right-0 z-40 px-4 md:hidden">
      <Link
        href="/cart"
        className="group relative flex items-center justify-between w-full px-5 py-3.5 bg-primary text-primary-foreground rounded-2xl font-medium shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform overflow-hidden"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-active:translate-x-full transition-transform duration-700" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{formatCurrency(subtotal)}</span>
          <ArrowRight className="w-4 h-4 opacity-70" />
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
        className="flex items-center justify-between w-full px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-medium shadow-lg shadow-primary/20 hover:brightness-105 transition-all"
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
