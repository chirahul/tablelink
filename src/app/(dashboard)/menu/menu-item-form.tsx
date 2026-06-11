"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Leaf, Drumstick } from "lucide-react";
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
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { createMenuItem, updateMenuItem } from "../admin-actions";
import type { Category, MenuAddon, MenuItem, MenuVariant } from "@/lib/types";

type Props = {
  item?: MenuItem;
  categories: Category[];
  defaultCategoryId?: string;
  onDone: (success: boolean) => void;
};

const QUICK_TAGS = ["Bestseller", "Spicy", "Popular", "Chef's Special", "New"];
const DESC_MAX = 160;

export function MenuItemForm({
  item,
  categories,
  defaultCategoryId,
  onDone,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!item;
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [categoryId, setCategoryId] = useState<string>(
    item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? ""
  );
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isVeg, setIsVeg] = useState(item?.is_veg ?? true);
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image_url ?? null);
  const [imageUploading, setImageUploading] = useState(false);
  const [variants, setVariants] = useState<MenuVariant[]>(item?.variants ?? []);
  const [addons, setAddons] = useState<MenuAddon[]>(item?.addons ?? []);
  const [addAnother, setAddAnother] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Validation
  const priceNum = Number(price);
  const errors = {
    name: !name.trim() ? "Name is required" : "",
    price:
      price === "" || Number.isNaN(priceNum) || priceNum <= 0
        ? "Enter a price greater than 0"
        : "",
    category: !categoryId ? "Pick a category" : "",
  };
  const hasErrors = !!(errors.name || errors.price || errors.category);
  const err = (k: keyof typeof errors) =>
    attempted && errors[k] ? (
      <p className="text-xs text-destructive">{errors[k]}</p>
    ) : null;

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }
  function toggleQuickTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function addVariant() {
    setVariants((v) => [...v, { name: "", price: 0 }]);
  }
  function addAddon() {
    setAddons((a) => [...a, { name: "", price: 0 }]);
  }

  function resetForNext() {
    setName("");
    setDescription("");
    setPrice("");
    setTags([]);
    setTagInput("");
    setImageUrl(null);
    setVariants([]);
    setAddons([]);
    setAttempted(false);
    nameRef.current?.focus();
  }

  function onSubmit() {
    setAttempted(true);
    if (hasErrors) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (imageUploading) {
      toast.error("Image is still uploading — give it a second.");
      return;
    }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("description", description.trim());
    fd.set("price", price);
    fd.set("sort_order", sortOrder || "0");
    fd.set("category_id", categoryId);
    fd.set("tags", tags.join(","));
    fd.set("is_veg", isVeg ? "true" : "false");
    fd.set("is_available", isAvailable ? "true" : "false");
    fd.set("image_url", imageUrl ?? "");
    fd.set(
      "variants",
      JSON.stringify(variants.filter((v) => v.name.trim() && v.price > 0))
    );
    fd.set(
      "addons",
      JSON.stringify(addons.filter((a) => a.name.trim() && a.price >= 0))
    );

    startTransition(async () => {
      const result = isEditing
        ? await updateMenuItem(item!.id, fd)
        : await createMenuItem(fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isEditing ? "Item updated" : "Menu item created");
      if (!isEditing && addAnother) resetForNext();
      else onDone(true);
    });
  }

  const selectedCategory = categories.find((c) => c.id === categoryId)?.name;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Menu Item" : "Create Menu Item"}
        </DialogTitle>
      </DialogHeader>

      {/* Image — top, larger */}
      <div className="mt-4">
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onUploadingChange={setImageUploading}
          label="Item photo"
          aspectRatio="square"
          size="lg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          JPG or PNG, up to 5MB. Square images look best on the menu.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mt-5">
        {/* Left: details */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Paneer Tikka"
              aria-invalid={attempted && !!errors.name}
            />
            {err("name")}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
              rows={2}
              placeholder="Short description shown on the menu"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {description.length}/{DESC_MAX}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="249"
                aria-invalid={attempted && !!errors.price}
              />
              {err("price")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger aria-invalid={attempted && !!errors.category}>
                <SelectValue placeholder="Choose a category">
                  {selectedCategory}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("category")}
          </div>
        </div>

        {/* Right: variants + add-ons */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variants (size options)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addVariant}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {variants.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Optional — e.g. Half / Full, Small / Medium / Large.
              </p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="e.g. Half"
                  value={v.name}
                  onChange={(e) =>
                    setVariants((arr) =>
                      arr.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="₹ price"
                  value={v.price || ""}
                  onChange={(e) =>
                    setVariants((arr) =>
                      arr.map((x, j) =>
                        j === i ? { ...x, price: Number(e.target.value) || 0 } : x
                      )
                    )
                  }
                  className="w-24"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Remove variant"
                  onClick={() =>
                    setVariants((arr) => arr.filter((_, j) => j !== i))
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Add-ons (extras)</Label>
              <Button type="button" size="sm" variant="outline" onClick={addAddon}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {addons.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Optional — e.g. Extra cheese (+₹30), Extra sauce.
              </p>
            )}
            {addons.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="e.g. Extra Cheese"
                  value={a.name}
                  onChange={(e) =>
                    setAddons((arr) =>
                      arr.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="₹ price"
                  value={a.price || ""}
                  onChange={(e) =>
                    setAddons((arr) =>
                      arr.map((x, j) =>
                        j === i ? { ...x, price: Number(e.target.value) || 0 } : x
                      )
                    )
                  }
                  className="w-24"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Remove add-on"
                  onClick={() => setAddons((arr) => arr.filter((_, j) => j !== i))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: tags, type, availability */}
      <div className="space-y-4 mt-5 pt-4 border-t">
        <div className="space-y-2">
          <Label>Tags</Label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags((p) => p.filter((x) => x !== t))}
                    aria-label={`Remove ${t}`}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Type a tag and press Enter"
          />
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleQuickTag(t)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  tags.includes(t)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:border-primary/40 hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 flex-wrap">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="inline-flex rounded-lg border p-0.5">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                aria-pressed={isVeg}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isVeg
                    ? "bg-success-container text-success"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Leaf className="w-3.5 h-3.5" /> Veg
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                aria-pressed={!isVeg}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !isVeg
                    ? "bg-destructive-container text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Drumstick className="w-3.5 h-3.5" /> Non-Veg
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label>Available</Label>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-6 px-6 py-3 mt-5 bg-card border-t flex items-center justify-between gap-3">
        {!isEditing ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={addAnother}
              onChange={(e) => setAddAnother(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Add another after save
          </label>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => onDone(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || imageUploading}>
            {imageUploading
              ? "Uploading image..."
              : isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create Menu Item"}
          </Button>
        </div>
      </div>
    </form>
  );
}
