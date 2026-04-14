"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { createMenuItem, updateMenuItem } from "../admin-actions";
import type { Category, MenuAddon, MenuItem, MenuVariant } from "@/lib/types";

type Props = {
  item?: MenuItem;
  categories: Category[];
  defaultCategoryId?: string;
  onDone: (success: boolean) => void;
};

export function MenuItemForm({
  item,
  categories,
  defaultCategoryId,
  onDone,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!item;

  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image_url ?? null
  );
  const [variants, setVariants] = useState<MenuVariant[]>(
    item?.variants ?? []
  );
  const [addons, setAddons] = useState<MenuAddon[]>(item?.addons ?? []);
  const [categoryId, setCategoryId] = useState<string>(
    item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? ""
  );

  function addVariant() {
    setVariants((v) => [...v, { name: "", price: 0 }]);
  }
  function updateVariant(idx: number, patch: Partial<MenuVariant>) {
    setVariants((v) => v.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function removeVariant(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  function addAddon() {
    setAddons((a) => [...a, { name: "", price: 0 }]);
  }
  function updateAddon(idx: number, patch: Partial<MenuAddon>) {
    setAddons((a) => a.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function removeAddon(idx: number) {
    setAddons((a) => a.filter((_, i) => i !== idx));
  }

  async function onSubmit(formData: FormData) {
    // Attach state-managed fields
    formData.set("category_id", categoryId);
    formData.set("image_url", imageUrl ?? "");
    formData.set(
      "variants",
      JSON.stringify(
        variants.filter((v) => v.name.trim() && v.price > 0)
      )
    );
    formData.set(
      "addons",
      JSON.stringify(
        addons.filter((a) => a.name.trim() && a.price >= 0)
      )
    );

    startTransition(async () => {
      const result = isEditing
        ? await updateMenuItem(item!.id, formData)
        : await createMenuItem(formData);

      if (result.success) {
        toast.success(isEditing ? "Item updated" : "Item created");
        onDone(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Item" : "New Menu Item"}</DialogTitle>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name ?? ""}
              required
              placeholder="e.g. Paneer Tikka"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description ?? ""}
              rows={2}
              placeholder="Short description shown on the menu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.price ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={item?.sort_order ?? 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={item?.tags?.join(", ") ?? ""}
              placeholder="bestseller, spicy, new"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_veg"
                name="is_veg"
                defaultChecked={item?.is_veg ?? true}
              />
              <Label htmlFor="is_veg">Vegetarian</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_available"
                name="is_available"
                defaultChecked={item?.is_available ?? true}
              />
              <Label htmlFor="is_available">Available</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            label="Item image"
            aspectRatio="square"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variants (size options)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addVariant}
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {variants.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Optional. Example: Half / Full, Small / Medium / Large.
              </p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Name (e.g. Half)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, { name: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price || ""}
                  onChange={(e) =>
                    updateVariant(i, { price: Number(e.target.value) || 0 })
                  }
                  className="w-24"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => removeVariant(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Add-ons (extras)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAddon}
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {addons.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Optional. Example: Extra cheese, Extra sauce.
              </p>
            )}
            {addons.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Name (e.g. Extra Cheese)"
                  value={a.name}
                  onChange={(e) => updateAddon(i, { name: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={a.price || ""}
                  onChange={(e) =>
                    updateAddon(i, { price: Number(e.target.value) || 0 })
                  }
                  className="w-24"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => removeAddon(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create item"}
        </Button>
      </DialogFooter>
    </form>
  );
}
