"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLAN_LIST, PLANS, type PlanId, type SubStatus } from "@/lib/plans";
import {
  activateSubscription,
  extendSubscription,
  expireSubscription,
  resetTrial,
} from "@/app/(admin)/actions";

export type SubRow = {
  id: string;
  name: string;
  slug: string;
  status: SubStatus;
  daysLeft: number;
  endsAt: string | null;
  plan: PlanId | null;
  tables: number;
  recommended: PlanId;
};

const STATUS_STYLES: Record<SubStatus, string> = {
  active: "bg-success-container text-success",
  trialing: "bg-primary/10 text-primary",
  expired: "bg-destructive-container text-destructive",
};

function fmtDate(s: string | null) {
  return s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export function SubscriptionsList({ rows }: { rows: SubRow[] }) {
  const [filter, setFilter] = useState<"all" | SubStatus>("all");
  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["all", "trialing", "active", "expired"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "hover:border-foreground/40"
            }`}
          >
            {f} ({f === "all" ? rows.length : rows.filter((r) => r.status === f).length})
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Restaurant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-center">Tables</TableHead>
              <TableHead>Renewal / Trial</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No restaurants in this view.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => <SubscriptionRow key={r.id} row={r} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SubscriptionRow({ row }: { row: SubRow }) {
  const [isPending, startTransition] = useTransition();
  const [plan, setPlan] = useState<PlanId>(row.plan ?? row.recommended);

  function run(fn: () => Promise<{ success: boolean; message?: string; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.success) toast.success(res.message ?? "Updated");
      else toast.error(res.error ?? "Failed");
    });
  }

  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/restaurants/${row.id}`} className="font-medium hover:underline">
          {row.name}
        </Link>
        <div className="text-xs text-muted-foreground">/menu/{row.slug}</div>
      </TableCell>
      <TableCell>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}>
          {row.status}
        </span>
      </TableCell>
      <TableCell className="text-sm">
        {row.plan ? PLANS[row.plan].name : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-center text-sm tabular-nums">{row.tables}</TableCell>
      <TableCell className="text-sm whitespace-nowrap">
        {row.status === "trialing"
          ? `${row.daysLeft}d left · ${fmtDate(row.endsAt)}`
          : row.status === "active"
            ? `until ${fmtDate(row.endsAt)}`
            : `expired ${fmtDate(row.endsAt)}`}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
          <Select value={plan} onValueChange={(v) => setPlan((v as PlanId) ?? row.recommended)}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAN_LIST.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" disabled={isPending} onClick={() => run(() => activateSubscription(row.id, plan))}>
            Activate
          </Button>
          {row.status === "active" && (
            <Button size="sm" variant="outline" className="h-8" disabled={isPending} onClick={() => run(() => extendSubscription(row.id))}>
              +1yr
            </Button>
          )}
          {row.status !== "expired" ? (
            <Button size="sm" variant="outline" className="h-8" disabled={isPending} onClick={() => run(() => expireSubscription(row.id))}>
              Expire
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-8" disabled={isPending} onClick={() => run(() => resetTrial(row.id))}>
              Trial
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
