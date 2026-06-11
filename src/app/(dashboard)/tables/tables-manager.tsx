"use client";

import { useMemo, useState, useTransition } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Trash2,
  Plus,
  Printer,
  FileDown,
  GripVertical,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Search,
  LayoutGrid,
} from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ActionsMenu } from "@/components/shared/actions-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { Reorderable } from "@/components/shared/reorderable";
import { buildQrPdf, downloadBlob, type QrEntry } from "@/lib/qr-pdf";
import {
  createTable,
  deleteTable,
  updateTable,
  duplicateTable,
  setTableActive,
  reorderTables,
} from "../admin-actions";
import type { Table } from "@/lib/types";
import { QrDialog } from "./qr-dialog";

type TableStats = Record<string, { scans: number; orders: number }>;

type Props = {
  tables: Table[];
  stats: TableStats;
  restaurantSlug: string;
  restaurantName: string;
};

function menuUrl(slug: string, tableId: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://thetablelynk.com";
  return `${origin}/menu/${slug}?table=${tableId}`;
}

export function TablesManager({
  tables,
  stats,
  restaurantSlug,
  restaurantName,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [deleting, setDeleting] = useState<Table | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const sortable = !search.trim();
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? tables.filter((t) => t.table_number.toLowerCase().includes(q))
      : tables;
  }, [tables, search]);

  const totalSeats = tables.reduce((s, t) => s + (t.capacity ?? 0), 0);

  function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const r = await deleteTable(deleting.id);
      if (r.success) toast.success("Table deleted");
      else toast.error(r.error);
      setDeleting(null);
    });
  }

  function onDuplicate(id: string) {
    startTransition(async () => {
      const r = await duplicateTable(id);
      if (r.success) toast.success("Table duplicated");
      else toast.error(r.error);
    });
  }

  function onToggleActive(t: Table) {
    startTransition(async () => {
      const r = await setTableActive(t.id, !t.is_active);
      if (!r.success) toast.error(r.error);
    });
  }

  function onReorder(ids: string[]) {
    startTransition(async () => {
      const r = await reorderTables(ids);
      if (r.success) toast.success("Order updated");
      else toast.error(r.error);
    });
  }

  async function generateAll(list: Table[]): Promise<QrEntry[]> {
    return Promise.all(
      list.map(async (t) => ({
        tableNumber: t.table_number,
        dataUrl: await QRCode.toDataURL(menuUrl(restaurantSlug, t.id), {
          width: 600,
          margin: 2,
        }),
      }))
    );
  }

  async function downloadAllPdf() {
    if (tables.length === 0) return;
    setBusy(true);
    const t = toast.loading("Building PDF…");
    try {
      const entries = await generateAll(tables);
      downloadBlob(
        buildQrPdf(entries, restaurantName),
        `${restaurantSlug}-qr-codes.pdf`
      );
      toast.success("PDF downloaded", { id: t });
    } catch {
      toast.error("Failed to build PDF", { id: t });
    } finally {
      setBusy(false);
    }
  }

  async function printAll() {
    if (tables.length === 0) return;
    setBusy(true);
    const t = toast.loading("Preparing print sheet…");
    try {
      const entries = await generateAll(tables);
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Allow pop-ups to print", { id: t });
        return;
      }
      const cards = entries
        .map(
          (e) => `
        <div class="card">
          <div class="name">${restaurantName}</div>
          <div class="sub">Scan to order</div>
          <img src="${e.dataUrl}" />
          <div class="t">Table ${e.tableNumber}</div>
        </div>`
        )
        .join("");
      win.document.write(`
        <html><head><title>${restaurantName} — QR Codes</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; margin: 0; padding: 16px;
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .card { border: 2px solid #000; border-radius: 12px; padding: 16px; text-align: center; break-inside: avoid; }
          .name { font-weight: 700; font-size: 16px; }
          .sub { color: #555; font-size: 12px; margin-bottom: 8px; }
          img { width: 100%; max-width: 260px; }
          .t { font-size: 24px; font-weight: 800; margin-top: 8px; }
        </style></head>
        <body onload="window.print(); window.close();">${cards}</body></html>
      `);
      win.document.close();
      toast.dismiss(t);
    } finally {
      setBusy(false);
    }
  }

  function renderCard(t: Table, handle?: React.ReactNode) {
    const s = stats[t.id] ?? { scans: 0, orders: 0 };
    return (
      <div
        onClick={() => setEditing(t)}
        className={`p-4 rounded-xl border bg-card flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all ${
          t.is_active ? "" : "opacity-60"
        }`}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {handle}
            <span className="text-2xl font-bold truncate">
              {t.table_number}
            </span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionsMenu
              items={[
                { label: "Edit", icon: Pencil, onSelect: () => setEditing(t) },
                {
                  label: "Show QR",
                  icon: QrCode,
                  onSelect: () => setQrTable(t),
                },
                {
                  label: "Duplicate",
                  icon: Copy,
                  onSelect: () => onDuplicate(t.id),
                },
                {
                  label: t.is_active ? "Hide" : "Show",
                  icon: t.is_active ? EyeOff : Eye,
                  onSelect: () => onToggleActive(t),
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  onSelect: () => setDeleting(t),
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {t.capacity ? `Seats ${t.capacity}` : "No capacity set"}
          {!t.is_active && (
            <span className="ml-2 inline-block px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">
              Hidden
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{s.scans} scans</span>
          <span>{s.orders} orders</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1"
          onClick={(e) => {
            e.stopPropagation();
            setQrTable(t);
          }}
        >
          <QrCode className="w-4 h-4" /> QR Code
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 p-3 rounded-xl border bg-card">
        <div className="flex items-center gap-4 text-sm">
          <span>
            <span className="font-bold">{tables.length}</span>{" "}
            <span className="text-muted-foreground">Tables</span>
          </span>
          <span>
            <span className="font-bold">{totalSeats}</span>{" "}
            <span className="text-muted-foreground">Seats</span>
          </span>
          <span>
            <span className="font-bold">{tables.length}</span>{" "}
            <span className="text-muted-foreground">QR Codes</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={busy || tables.length === 0}
            onClick={printAll}
            className="gap-1"
          >
            <Printer className="w-4 h-4" /> Print All
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || tables.length === 0}
            onClick={downloadAllPdf}
            className="gap-1"
          >
            <FileDown className="w-4 h-4" /> Download PDF
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Add Table
          </Button>
        </div>
      </div>

      {tables.length > 6 && (
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tables"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {tables.length === 0 ? (
        <EmptyState
          card
          icon={<LayoutGrid className="w-7 h-7" />}
          title="No tables yet"
          description="Add your restaurant's tables and generate a unique QR code for each. Customers scan the QR to order from that table."
          action={{
            label: "Add your first table",
            onClick: () => setCreating(true),
          }}
        />
      ) : sortable ? (
        <Reorderable
          items={visible}
          getId={(t) => t.id}
          onReorder={onReorder}
          strategy="grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {(t, handle) =>
            renderCard(
              t,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((t) => (
            <div key={t.id}>{renderCard(t)}</div>
          ))}
        </div>
      )}

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <TableForm onDone={(s) => s && setCreating(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing && (
            <TableForm table={editing} onDone={(s) => s && setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>

      <QrDialog
        table={qrTable}
        restaurantSlug={restaurantSlug}
        restaurantName={restaurantName}
        onClose={() => setQrTable(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete table ${deleting?.table_number}?`}
        description="Existing orders for this table will remain but won't be linkable. This action cannot be undone."
        confirmLabel="Delete table"
        onConfirm={onConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}

function TableForm({
  table,
  onDone,
}: {
  table?: Table;
  onDone: (success: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const editing = !!table;

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const r = editing
        ? await updateTable(table!.id, formData)
        : await createTable(formData);
      if (r.success) {
        toast.success(editing ? "Table updated" : "Table created");
        onDone(true);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Table" : "New Table"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="table_number">Table number</Label>
        <Input
          id="table_number"
          name="table_number"
          placeholder="e.g. T1, Patio-3"
          defaultValue={table?.table_number ?? ""}
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
          defaultValue={table?.capacity ?? ""}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : editing
              ? "Save changes"
              : "Create table"}
        </Button>
      </DialogFooter>
    </form>
  );
}
