"use client";

import { useState, useTransition } from "react";
import { QrCode, Trash2, Plus, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTable, deleteTable } from "../admin-actions";
import type { Table } from "@/lib/types";
import { QrDialog } from "./qr-dialog";

type Props = {
  tables: Table[];
  restaurantSlug: string;
  restaurantName: string;
};

export function TablesManager({
  tables,
  restaurantSlug,
  restaurantName,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [qrTable, setQrTable] = useState<Table | null>(null);

  function onDelete(id: string, tableNumber: string) {
    if (
      !confirm(
        `Delete table ${tableNumber}? Orders assigned to this table will remain but won't be linkable.`
      )
    )
      return;
    startTransition(async () => {
      const r = await deleteTable(id);
      if (r.success) toast.success("Table deleted");
      else toast.error(r.error);
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Table
        </Button>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent>
            <CreateTableForm onDone={(s) => s && setCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No tables yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Add your restaurant&apos;s tables and generate a unique QR code for each. Customers scan the QR to order from that table.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tables.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-lg border bg-card flex flex-col items-center text-center"
            >
              <div className="text-2xl font-bold mb-1">{t.table_number}</div>
              {t.capacity && (
                <div className="text-xs text-muted-foreground mb-3">
                  Seats {t.capacity}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQrTable(t)}
                >
                  <QrCode className="w-4 h-4 mr-1" /> QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onDelete(t.id, t.table_number)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QrDialog
        table={qrTable}
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
        onClose={() => setQrTable(null)}
      />
    </div>
  );
}

function CreateTableForm({
  onDone,
}: {
  onDone: (success: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const r = await createTable(formData);
      if (r.success) {
        toast.success("Table created");
        onDone(true);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>New Table</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="table_number">Table number</Label>
        <Input
          id="table_number"
          name="table_number"
          placeholder="e.g. T1, Patio-3"
          required
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity (optional)</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          placeholder="e.g. 4"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create table"}
        </Button>
      </DialogFooter>
    </form>
  );
}
