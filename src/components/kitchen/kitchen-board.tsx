"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAudioAlert } from "@/hooks/use-audio-alert";
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
    accent: "bg-yellow-50 border-yellow-200",
  },
  {
    title: "Preparing",
    statuses: ["preparing"],
    accent: "bg-orange-50 border-orange-200",
  },
  {
    title: "Ready",
    statuses: ["ready"],
    accent: "bg-green-50 border-green-200",
  },
  {
    title: "Served",
    statuses: ["served"],
    accent: "bg-gray-50 border-gray-200",
  },
];

export function KitchenBoard({ restaurantId, initialOrders }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

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

  const ordersByStatus = (statuses: OrderStatus[]) =>
    orders
      .filter((o) => statuses.includes(o.status))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const list = ordersByStatus(col.statuses);
          return (
            <div
              key={col.title}
              className={`rounded-xl border ${col.accent} flex flex-col min-h-[200px] lg:min-h-0`}
            >
              <div className="px-3 py-2 font-semibold text-sm flex items-center justify-between">
                <span>{col.title}</span>
                <span className="text-xs opacity-70">{list.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 pt-0 space-y-2">
                {list.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No orders
                  </p>
                )}
                {list.map((o) => (
                  <OrderTicket key={o.id} order={o} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
