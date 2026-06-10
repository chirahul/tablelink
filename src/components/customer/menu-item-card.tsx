"use client";

import { Plus, Flame } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { VegIndicator } from "./veg-indicator";
import { useCartStore } from "@/stores/cart-store";

type Props = {
  item: MenuItem;
  onClick: () => void;
};

export function MenuItemCard({ item, onClick }: Props) {
  const unavailable = !item.is_available;
  const addItem = useCartStore((s) => s.addItem);

  // Quick-add for highly-reordered items: adds with the default variant and no
  // add-ons (the common "just reorder it" path). Tapping the card still opens
  // the detail modal for full customization.
  function quickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    const defaultVariant = item.variants?.[0] ?? null;
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: defaultVariant?.price ?? item.price,
      quantity: 1,
      variant: defaultVariant,
      addons: [],
      notes: "",
      is_veg: item.is_veg,
      image_url: item.image_url,
    });
    toast.success(`Added ${item.name} to cart`);
  }

  return (
    <div
      onClick={unavailable ? undefined : onClick}
      onKeyDown={(e) => {
        if (!unavailable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-disabled={unavailable}
      className={`group w-full text-left p-4 rounded-2xl border bg-card transition-all duration-200 flex gap-4 ${
        unavailable
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-primary/30 hover:shadow-md active:scale-[0.99] cursor-pointer"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <VegIndicator isVeg={item.is_veg} />
          <h3 className="font-semibold truncate">{item.name}</h3>
          {item.is_popular && (
            <Badge className="bg-accent text-accent-foreground border-0 rounded-full text-[10px] gap-0.5 shrink-0">
              <Flame className="w-3 h-3" />
              Popular
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">{formatCurrency(item.price)}</span>
          {item.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="relative shrink-0">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-xl shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Quick-add: only for highly-reordered, available items. */}
        {item.is_popular && !unavailable && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${item.name} to cart`}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 h-8
                       rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md
                       border-2 border-card active:scale-95 hover:brightness-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            ADD
          </button>
        )}
      </div>
    </div>
  );
}
