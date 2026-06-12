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

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No restaurants in this view.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <SubscriptionRow key={r.id} row={r} />
          ))}
        </div>
      )}
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
    <div className="p-4 rounded-xl border bg-card flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/admin/restaurants/${row.id}`} className="font-semibold hover:underline">
            {row.name}
          </Link>
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}>
            {row.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {row.tables} tables ·{" "}
          {row.status === "trialing"
            ? `${row.daysLeft}d trial left · ends ${fmtDate(row.endsAt)}`
            : row.status === "active"
              ? `${row.plan ? PLANS[row.plan].name : "Active"} · expires ${fmtDate(row.endsAt)}`
              : `expired ${fmtDate(row.endsAt)}`}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={plan} onValueChange={(v) => setPlan((v as PlanId) ?? row.recommended)}>
          <SelectTrigger className="w-32 h-9">
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
        <Button size="sm" disabled={isPending} onClick={() => run(() => activateSubscription(row.id, plan))}>
          Activate 1yr
        </Button>
        {row.status === "active" && (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => extendSubscription(row.id))}>
            +1yr
          </Button>
        )}
        {row.status !== "expired" ? (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => expireSubscription(row.id))}>
            Expire
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => resetTrial(row.id))}>
            Start trial
          </Button>
        )}
      </div>
    </div>
  );
}
