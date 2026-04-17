"use client";

import { useState, useTransition } from "react";
import { FolderOpen, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../admin-actions";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

export function CategoriesManager({ categories }: Props) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const r = await deleteCategory(deleting.id);
      if (r.success) toast.success("Category deleted");
      else toast.error(r.error);
      setDeleting(null);
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Category
        </Button>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent>
            <CategoryForm
              onDone={(success) => {
                if (success) setCreating(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No categories yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Categories group your menu — like Starters, Main Course, Beverages. Create your first one to start adding items.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-lg border bg-card flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  <span>{c.name}</span>
                  {!c.is_active && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      hidden
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-sm text-muted-foreground">
                    {c.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {c.sort_order}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditing(c)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending}
                  onClick={() => setDeleting(c)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing && (
            <CategoryForm
              category={editing}
              onDone={(success) => {
                if (success) setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This will also delete all menu items in this category. This action cannot be undone."
        confirmLabel="Delete category"
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category?: Category;
  onDone: (success: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!category;

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateCategory(category!.id, formData)
        : await createCategory(formData);

      if (result.success) {
        toast.success(isEditing ? "Category updated" : "Category created");
        onDone(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Category" : "New Category"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={category?.name ?? ""}
          required
          placeholder="e.g. Starters"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order (lower shows first)</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={category?.sort_order ?? 0}
        />
      </div>
      {isEditing && (
        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">Visible to customers</Label>
          <Switch
            id="is_active"
            name="is_active"
            defaultChecked={category!.is_active}
          />
        </div>
      )}

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
