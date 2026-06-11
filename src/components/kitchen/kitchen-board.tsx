"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAudioAlert } from "@/hooks/use-audio-alert";
import { formatRelativeTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { OrderTicket, type KitchenOrder } from "./order-ticket";

type Props = {
  restaurantId: string;
  initialOrders: KitchenOrder[];
};

const COLUMNS: { title: string; statuses: OrderStatus[]; accent: string }[] = [
  {
    title: "New",
    statuses: ["pending", "confirmed"],
    accent: "bg-info-container border-border",
  },
  {
    title: "Preparing",
    statuses: ["preparing"],
    accent: "bg-warning-container border-border",
  },
  {
    title: "Ready",
    statuses: ["ready"],
    accent: "bg-success-container border-border",
  },
  {
    title: "Served",
    statuses: ["served"],
    accent: "bg-muted border-border",
  },
];

export function KitchenBoard({ restaurantId, initialOrders }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);

  const { enabled, enable, play } = useAudioAlert();
  const supabase = createClient();

  // Subscribe to realtime order changes for this restaurant.
  useEffect(() => {
    const channel = supabase
      .channel(`kitchen-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newId = (payload.new as { id: string }).id;
            // Fetch the full order with items + table
            const { data } = await supabase
              .from("orders")
              .select(
                `*, order_items(*, menu_item:menu_items(id, name, is_veg)), table:tables(id, table_number)`
              )
              .eq("id", newId)
              .maybeSingle();

            if (data) {
              setOrders((prev) => [data as unknown as KitchenOrder, ...prev]);
              play();
              toast.success(`New order from table ${(data as { table: { table_number: string } }).table.table_number}`);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Partial<KitchenOrder>;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id ? { ...o, ...updated } : o
              )
            );
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id: string }).id;
            setOrders((prev) => prev.filter((o) => o.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleLocalUpdate = useCallback(
    (id: string, patch: Partial<KitchenOrder>) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
      );
    },
    []
  );

  const ordersByStatus = (statuses: OrderStatus[]) =>
    orders
      .filter((o) => statuses.includes(o.status))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status)
  );
  const oldest = activeOrders.reduce<KitchenOrder | null>(
    (m, o) =>
      !m || new Date(o.created_at) < new Date(m.created_at) ? o : m,
    null
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
          <span className="text-sm text-muted-foreground">
            {activeOrders.length} active
            {oldest && (
              <>
                {" · oldest "}
                <span className="font-medium text-foreground">
                  {formatRelativeTime(oldest.created_at)}
                </span>
              </>
            )}
          </span>
        </div>
        <Button
          variant={enabled ? "default" : "outline"}
          size="sm"
          onClick={enabled ? play : enable}
        >
          {enabled ? (
            <>
              <Volume2 className="w-4 h-4 mr-1" />
              Sound on (test)
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 mr-1" />
              Enable sound
            </>
          )}
        </Button>
      </div>

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
                <span className="min-w-6 h-6 px-2 rounded-full bg-background/70 border border-border flex items-center justify-center text-xs font-semibold">{list.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 pt-0 space-y-2">
                {list.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No orders
                  </p>
                )}
                {list.map((o) => (
                  <OrderTicket
                    key={o.id}
                    order={o}
                    onLocalUpdate={handleLocalUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
