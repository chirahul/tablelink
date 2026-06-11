"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  Search,
  GripVertical,
  ImageOff,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { VegIndicator } from "@/components/customer/veg-indicator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ActionsMenu } from "@/components/shared/actions-menu";
import { Reorderable } from "@/components/shared/reorderable";
import {
  deleteMenuItem,
  toggleMenuItemAvailability,
  duplicateMenuItem,
  reorderMenuItems,
  bulkSetMenuItemsAvailability,
  bulkDeleteMenuItems,
} from "../admin-actions";
import type { Category, MenuItem } from "@/lib/types";
import { MenuItemForm } from "./menu-item-form";

type Props = {
  items: MenuItem[];
  categories: Category[];
};

type Veg = "all" | "veg" | "nonveg";
type Avail = "all" | "available" | "hidden";
type Sort = "order" | "name" | "price" | "updated";

export function MenuItemsManager({ items, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [veg, setVeg] = useState<Veg>("all");
  const [avail, setAvail] = useState<Avail>("all");
  const [sort, setSort] = useState<Sort>("order");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sortable =
    sort === "order" && !search.trim() && veg === "all" && avail === "all";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filterCategory !== "all" && i.category_id !== filterCategory)
        return false;
      if (veg === "veg" && !i.is_veg) return false;
      if (veg === "nonveg" && i.is_veg) return false;
      if (avail === "available" && !i.is_available) return false;
      if (avail === "hidden" && i.is_available) return false;
      if (q && !`${i.name} ${i.description ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, filterCategory, search, veg, avail]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "price") arr.sort((a, b) => a.price - b.price);
    else if (sort === "updated")
      arr.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    else arr.sort((a, b) => a.sort_order - b.sort_order);
    return arr;
  }, [filtered, sort]);

  const byCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const c of categories) map.set(c.id, []);
    for (const i of sorted) map.get(i.category_id)?.push(i);
    return map;
  }, [sorted, categories]);

  function toggleAvailability(id: string, v: boolean) {
    startTransition(async () => {
      const r = await toggleMenuItemAvailability(id, v);
      if (!r.success) toast.error(r.error);
    });
  }

  function onDuplicate(id: string) {
    startTransition(async () => {
      const r = await duplicateMenuItem(id);
      if (r.success) toast.success("Item duplicated");
      else toast.error(r.error);
    });
  }

  function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const r = await deleteMenuItem(deleting.id);
      if (r.success) toast.success("Item deleted");
      else toast.error(r.error);
      setDeleting(null);
    });
  }

  function onReorderCategory(ids: string[]) {
    startTransition(async () => {
      const r = await reorderMenuItems(ids);
      if (r.success) toast.success("Order updated");
      else toast.error(r.error);
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkAvailability(v: boolean) {
    const ids = [...selected];
    startTransition(async () => {
      const r = await bulkSetMenuItemsAvailability(ids, v);
      if (r.success) {
        toast.success(`${ids.length} item(s) ${v ? "enabled" : "hidden"}`);
        setSelected(new Set());
      } else toast.error(r.error);
    });
  }

  function onConfirmBulkDelete() {
    const ids = [...selected];
    startTransition(async () => {
      const r = await bulkDeleteMenuItems(ids);
      if (r.success) {
        toast.success(`${ids.length} item(s) deleted`);
        setSelected(new Set());
      } else toast.error(r.error);
      setBulkDeleting(false);
    });
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "hover:border-primary/40 hover:bg-accent"
    }`;

  function renderItem(i: MenuItem, dragHandle?: React.ReactNode) {
    const missing: string[] = [];
    if (!i.image_url) missing.push("image");
    if (!i.description) missing.push("description");

    return (
      <div
        onClick={() => setEditing(i)}
        className="p-3 rounded-lg border bg-card flex items-center gap-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
      >
        <span onClick={(e) => e.stopPropagation()} className="shrink-0 flex">
          <Checkbox
            checked={selected.has(i.id)}
            onCheckedChange={() => toggleSelect(i.id)}
            aria-label={`Select ${i.name}`}
          />
        </span>
        {dragHandle}
        {i.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={i.image_url}
            alt={i.name}
            className="w-14 h-14 rounded object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded bg-muted shrink-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <VegIndicator isVeg={i.is_veg} />
            <span className="font-medium truncate">{i.name}</span>
            {missing.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-warning bg-warning-container px-1.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                No {missing.join(" / ")}
              </span>
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

        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`text-xs font-medium hidden sm:inline ${
              i.is_available ? "text-success" : "text-muted-foreground"
            }`}
          >
            {i.is_available ? "Active" : "Hidden"}
          </span>
          <Switch
            checked={i.is_available}
            disabled={isPending}
            onCheckedChange={(v) => toggleAvailability(i.id, v)}
          />
          <ActionsMenu
            items={[
              { label: "Edit", icon: Pencil, onSelect: () => setEditing(i) },
              {
                label: "Duplicate",
                icon: Copy,
                onSelect: () => onDuplicate(i.id),
              },
              {
                label: "Delete",
                icon: Trash2,
                onSelect: () => setDeleting(i),
                destructive: true,
                separatorBefore: true,
              },
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search menu items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Manual order</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="price">Price (low–high)</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterCategory("all")} className={chip(filterCategory === "all")}>
            All ({items.length})
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category_id === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={chip(filterCategory === c.id)}
              >
                {c.name} ({count})
              </button>
            );
          })}
          <span className="w-px h-5 bg-border mx-1" />
          <button onClick={() => setVeg(veg === "veg" ? "all" : "veg")} className={chip(veg === "veg")}>
            Veg
          </button>
          <button onClick={() => setVeg(veg === "nonveg" ? "all" : "nonveg")} className={chip(veg === "nonveg")}>
            Non-Veg
          </button>
          <button onClick={() => setAvail(avail === "available" ? "all" : "available")} className={chip(avail === "available")}>
            Available
          </button>
          <button onClick={() => setAvail(avail === "hidden" ? "all" : "hidden")} className={chip(avail === "hidden")}>
            Hidden
          </button>
        </div>
      </div>

      {/* Sticky New Item bar */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-background/85 backdrop-blur-sm flex items-center justify-between gap-2 mb-2">
        <p className="text-xs text-muted-foreground">
          {sorted.length} item{sorted.length === 1 ? "" : "s"} shown
          {sortable ? "" : " · clear search/filters to reorder"}
        </p>
        <Button onClick={() => setCreating(true)} className="gap-1">
          <Plus className="w-4 h-4" /> New Item
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          No items match. Adjust filters or add one.
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((c) => {
            const catItems = byCategory.get(c.id) ?? [];
            if (catItems.length === 0) return null;
            const isCollapsed = collapsed.has(c.id);
            return (
              <section key={c.id}>
                <button
                  onClick={() => toggleCollapse(c.id)}
                  className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-muted-foreground hover:text-foreground sticky top-14 bg-background/85 backdrop-blur-sm py-1 w-full"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {c.name} ({catItems.length})
                </button>
                {!isCollapsed &&
                  (sortable ? (
                    <Reorderable
                      items={catItems}
                      getId={(i) => i.id}
                      onReorder={onReorderCategory}
                      className="space-y-2"
                    >
                      {(i, handle) =>
                        renderItem(
                          i,
                          <button
                            {...handle}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground touch-none shrink-0"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        )
                      }
                    </Reorderable>
                  ) : (
                    <div className="space-y-2">
                      {catItems.map((i) => (
                        <div key={i.id}>{renderItem(i)}</div>
                      ))}
                    </div>
                  ))}
              </section>
            );
          })}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card text-foreground rounded-full shadow-xl border px-2 py-1.5 text-sm">
          <span className="font-medium px-2">{selected.size} selected</span>
          <span className="w-px h-5 bg-border" />
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => bulkAvailability(true)}>
            Enable
          </Button>
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => bulkAvailability(false)}>
            Hide
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => setBulkDeleting(true)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <MenuItemForm
            categories={categories}
            defaultCategoryId={filterCategory !== "all" ? filterCategory : undefined}
            onDone={(s) => s && setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
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

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This menu item will be permanently removed. This action cannot be undone."
        confirmLabel="Delete item"
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />

      <ConfirmDialog
        open={bulkDeleting}
        onOpenChange={(o) => !o && setBulkDeleting(false)}
        title={`Delete ${selected.size} item(s)?`}
        description="These menu items will be permanently removed. This action cannot be undone."
        confirmLabel="Delete items"
        onConfirm={onConfirmBulkDelete}
        isPending={isPending}
      />
    </div>
  );
}
