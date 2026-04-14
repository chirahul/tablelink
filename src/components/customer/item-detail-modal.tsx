"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem, MenuVariant, MenuAddon } from "@/lib/types";
import { VegIndicator } from "./veg-indicator";
import { toast } from "sonner";

type Props = {
  item: MenuItem | null;
  onClose: () => void;
};

export function ItemDetailModal({ item, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const [variant, setVariant] = useState<MenuVariant | null>(null);
  const [addons, setAddons] = useState<MenuAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!item) return;
    // Reset defaults when opening a new item
    setVariant(item.variants?.[0] ?? null);
    setAddons([]);
    setQuantity(1);
    setNotes("");
  }, [item]);

  const basePrice = variant?.price ?? item?.price ?? 0;
  const addonTotal = useMemo(
    () => addons.reduce((sum, a) => sum + a.price, 0),
    [addons]
  );
  const total = (basePrice + addonTotal) * quantity;

  function toggleAddon(addon: MenuAddon) {
    setAddons((prev) =>
      prev.some((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  }

  function handleAddToCart() {
    if (!item) return;

    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: basePrice,
      quantity,
      variant,
      addons,
      notes,
      is_veg: item.is_veg,
      image_url: item.image_url,
    });

    toast.success(`Added ${quantity} × ${item.name} to cart`);
    onClose();
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {item && (
          <>
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <DialogHeader>
              <div className="flex items-center gap-2">
                <VegIndicator isVeg={item.is_veg} />
                <DialogTitle>{item.name}</DialogTitle>
              </div>
              {item.description && (
                <DialogDescription>{item.description}</DialogDescription>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap pt-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </DialogHeader>

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-2">
                <Label>Choose size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {item.variants.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        variant?.name === v.name
                          ? "border-foreground bg-accent"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <div>{v.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(v.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="space-y-2">
                <Label>Add-ons</Label>
                <div className="space-y-2">
                  {item.addons.map((a) => {
                    const checked = addons.some((x) => x.name === a.name);
                    return (
                      <label
                        key={a.name}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(a)}
                          className="h-4 w-4"
                        />
                        <span className="flex-1 text-sm">{a.name}</span>
                        <span className="text-sm text-muted-foreground">
                          +{formatCurrency(a.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special instructions (optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g. less spicy, no onions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-semibold w-8 text-center">
                  {quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <DialogFooter className="sm:justify-between gap-2">
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold">
                  {formatCurrency(total)}
                </div>
              </div>
              <Button onClick={handleAddToCart} size="lg">
                Add to Cart
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
