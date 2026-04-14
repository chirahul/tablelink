"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { VegIndicator } from "@/components/customer/veg-indicator";
import {
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../admin-actions";
import type { Category, MenuItem } from "@/lib/types";
import { MenuItemForm } from "./menu-item-form";

type Props = {
  items: MenuItem[];
  categories: Category[];
};

export function MenuItemsManager({ items, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filterCategory === "all") return items;
    return items.filter((i) => i.category_id === filterCategory);
  }, [items, filterCategory]);

  const byCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const c of categories) map.set(c.id, []);
    for (const i of filtered) {
      map.get(i.category_id)?.push(i);
    }
    return map;
  }, [filtered, categories]);

  function onToggle(id: string, newVal: boolean) {
    startTransition(async () => {
      const r = await toggleMenuItemAvailability(id, newVal);
      if (!r.success) toast.error(r.error);
    });
  }

  function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      const r = await deleteMenuItem(id);
      if (r.success) toast.success("Item deleted");
      else toast.error(r.error);
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">
          You need to create a category first before adding menu items.
        </p>
        <Link href="/menu/categories">
          <Button>Create a category</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1 rounded-full text-xs border ${
              filterCategory === "all"
                ? "bg-foreground text-background"
                : "hover:border-foreground/40"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category_id === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  filterCategory === c.id
                    ? "bg-foreground text-background"
                    : "hover:border-foreground/40"
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Item
        </Button>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <MenuItemForm
              categories={categories}
              defaultCategoryId={
                filterCategory !== "all" ? filterCategory : undefined
              }
              onDone={(s) => s && setCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No items in this view. Add one above.
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((c) => {
            const catItems = byCategory.get(c.id) ?? [];
            if (catItems.length === 0) return null;
            return (
              <section key={c.id}>
                <h2 className="text-sm font-semibold mb-2 text-muted-foreground">
                  {c.name}
                </h2>
                <div className="space-y-2">
                  {catItems.map((i) => (
                    <div
                      key={i.id}
                      className="p-3 rounded-lg border bg-card flex items-center gap-3"
                    >
                      {i.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={i.image_url}
                          alt={i.name}
                          className="w-14 h-14 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded bg-muted shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <VegIndicator isVeg={i.is_veg} />
                          <span className="font-medium truncate">
                            {i.name}
                          </span>
                          {!i.is_available && (
                            <Badge variant="outline" className="text-[10px]">
                              unavailable
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(i.price)}
                          {i.variants && i.variants.length > 0 && (
                            <> • {i.variants.length} variants</>
                          )}
                          {i.addons && i.addons.length > 0 && (
                            <> • {i.addons.length} add-ons</>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={i.is_available}
                          disabled={isPending}
                          onCheckedChange={(v) => onToggle(i.id, v)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditing(i)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isPending}
                          onClick={() => onDelete(i.id, i.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {editing && (
            <MenuItemForm
              item={editing}
              categories={categories}
              onDone={(s) => s && setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
