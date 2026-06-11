"use client";

import type { OrderStatus } from "@/lib/types";
import { OrderTicket, type KitchenOrder } from "./order-ticket";

type Props = {
  ordersByStatus: (statuses: OrderStatus[]) => KitchenOrder[];
  onLocalUpdate: (id: string, patch: Partial<KitchenOrder>) => void;
};

const COLUMNS: { title: string; statuses: OrderStatus[]; accent: string }[] = [
  { title: "New", statuses: ["pending", "confirmed"], accent: "bg-info-container border-border" },
  { title: "Preparing", statuses: ["preparing"], accent: "bg-warning-container border-border" },
  { title: "Ready", statuses: ["ready"], accent: "bg-success-container border-border" },
  { title: "Served", statuses: ["served"], accent: "bg-muted border-border" },
];

export function KitchenBoard({ ordersByStatus, onLocalUpdate }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible flex-1 min-h-0 pb-1">
      {COLUMNS.map((col) => {
        const list = ordersByStatus(col.statuses);
        return (
          <div
            key={col.title}
            className={`rounded-2xl border ${col.accent} flex flex-col min-h-0 w-[82vw] sm:w-80 lg:w-auto shrink-0`}
          >
            <div className="px-4 py-3 font-semibold text-sm flex items-center justify-between">
              <span>{col.title}</span>
              <span className="min-w-6 h-6 px-2 rounded-full bg-background/70 border border-border flex items-center justify-center text-xs font-semibold">
                {list.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 pt-0 space-y-2">
              {list.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No orders
                </p>
              )}
              {list.map((o) => (
                <OrderTicket key={o.id} order={o} onLocalUpdate={onLocalUpdate} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
