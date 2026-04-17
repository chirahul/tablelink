"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { isRestaurantOpen } from "@/lib/opening-hours";
import type { Category, MenuItem, Restaurant, Table } from "@/lib/types";
import { MenuItemCard } from "./menu-item-card";
import { ItemDetailModal } from "./item-detail-modal";
import { CartBar, DesktopCartBar } from "./cart-bar";

type Props = {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  table: Table | null;
};

type VegFilter = "all" | "veg" | "nonveg";

export function MenuBrowser({ restaurant, categories, items, table }: Props) {
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<VegFilter>("all");
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? ""
  );
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);

  const setContext = useCartStore((s) => s.setContext);

  useEffect(() => {
    // Set cart context so it clears if user switches restaurants
    setContext(restaurant.id, table?.id ?? "");
  }, [restaurant.id, table?.id, setContext]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (vegFilter === "veg" && !item.is_veg) return false;
      if (vegFilter === "nonveg" && item.is_veg) return false;
      if (q && !`${item.name} ${item.description ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, search, vegFilter]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const c of categories) map.set(c.id, []);
    for (const item of filteredItems) {
      const arr = map.get(item.category_id);
      if (arr) arr.push(item);
    }
    return map;
  }, [filteredItems, categories]);

  const hasResults = filteredItems.length > 0;

  const { isOpen, todayHours } = isRestaurantOpen(restaurant.opening_hours);

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        {!isOpen && (
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
            <div className="container max-w-2xl mx-auto flex items-center gap-2 text-sm text-orange-900">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Currently closed
                {todayHours
                  ? ` — opens at ${todayHours.open}`
                  : " — check back later"}
              </span>
            </div>
          </div>
        )}
        <div className="container max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">{restaurant.name}</h1>
              {table && (
                <p className="text-xs text-muted-foreground">
                  Table {table.table_number}
                </p>
              )}
            </div>
            <div className="flex rounded-full border overflow-hidden text-xs">
              <button
                onClick={() => setVegFilter("all")}
                className={`px-3 py-1.5 ${vegFilter === "all" ? "bg-foreground text-background" : ""}`}
              >
                All
              </button>
              <button
                onClick={() => setVegFilter("veg")}
                className={`px-3 py-1.5 border-l ${vegFilter === "veg" ? "bg-green-600 text-white" : ""}`}
              >
                Veg
              </button>
              <button
                onClick={() => setVegFilter("nonveg")}
                className={`px-3 py-1.5 border-l ${vegFilter === "nonveg" ? "bg-red-600 text-white" : ""}`}
              >
                Non-veg
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search dishes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
            {categories.map((c) => {
              const hasItems = (itemsByCategory.get(c.id) ?? []).length > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCategoryId(c.id);
                    document
                      .getElementById(`cat-${c.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  disabled={!hasItems}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    activeCategoryId === c.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card hover:border-foreground/40"
                  } ${!hasItems ? "opacity-40" : ""}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-4 pb-28 md:pb-6">
        {!hasResults && (
          <p className="text-center py-12 text-muted-foreground">
            No items match your search.
          </p>
        )}

        {categories.map((c) => {
          const categoryItems = itemsByCategory.get(c.id) ?? [];
          if (categoryItems.length === 0) return null;
          return (
            <section key={c.id} id={`cat-${c.id}`} className="mb-6 scroll-mt-40">
              <h2 className="text-lg font-semibold mb-3">{c.name}</h2>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setOpenItem(item)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <DesktopCartBar />
      </div>

      <CartBar />
      <ItemDetailModal item={openItem} onClose={() => setOpenItem(null)} />
    </>
  );
}
