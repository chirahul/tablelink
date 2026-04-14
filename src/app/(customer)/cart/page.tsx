"use client";

import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Your cart is empty. Go back to the menu to add items.
        </p>
      ) : (
        <div>
          <p className="text-muted-foreground">
            {getItemCount()} items - Subtotal: ₹{getSubtotal().toFixed(2)}
          </p>
          <div className="text-center text-muted-foreground py-12">
            Cart UI will be built here
          </div>
        </div>
      )}
    </div>
  );
}
