"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { setRestaurantActive } from "../../actions";
import type { Restaurant } from "@/lib/types";

type RowStats = {
  order_count: number;
  revenue: number;
};

type RestaurantWithStats = Restaurant & { stats: RowStats };

type Props = {
  restaurants: RestaurantWithStats[];
};

export function RestaurantsList({ restaurants }: Props) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "active" | "suspended">("all");

  const filtered = restaurants.filter((r) => {
    if (filter === "active") return r.is_active;
    if (filter === "suspended") return !r.is_active;
    return true;
  });

  function toggleActive(r: RestaurantWithStats) {
    const next = !r.is_active;
    if (!next && !confirm(`Suspend "${r.name}"? Their menu will go offline.`)) {
      return;
    }
    startTransition(async () => {
      const result = await setRestaurantActive(r.id, next);
      if (result.success) toast.success(result.message ?? "Updated");
      else toast.error(result.error);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(["all", "active", "suspended"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border capitalize ${
              filter === f
                ? "bg-foreground text-background"
                : "hover:border-foreground/40"
            }`}
          >
            {f}{" "}
            {f === "all"
              ? `(${restaurants.length})`
              : `(${
                  restaurants.filter((r) =>
                    f === "active" ? r.is_active : !r.is_active
                  ).length
                })`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No restaurants in this view.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-lg border bg-card flex items-center gap-4 flex-wrap"
            >
              {r.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.logo_url}
                  alt={r.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
                  {r.name[0]?.toUpperCase() ?? "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{r.name}</span>
                  <Badge
                    variant={r.is_active ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {r.is_active ? "Active" : "Suspended"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  /menu/{r.slug} •{" "}
                  {r.email || r.phone || "no contact"} • joined{" "}
                  {formatRelativeTime(r.created_at)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold">
                  {r.stats.order_count} orders
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(r.stats.revenue)}
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/menu/${r.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    View menu
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={r.is_active ? "outline" : "default"}
                  disabled={isPending}
                  onClick={() => toggleActive(r)}
                >
                  {r.is_active ? "Suspend" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
