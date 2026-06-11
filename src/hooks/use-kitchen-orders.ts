"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAudioAlert } from "@/hooks/use-audio-alert";
import type { OrderStatus } from "@/lib/types";
import type { KitchenOrder } from "@/components/kitchen/order-ticket";

const ACTIVE: OrderStatus[] = ["pending", "confirmed", "preparing", "ready"];

/**
 * Shared kitchen state + realtime: live orders for a restaurant via a Supabase
 * channel, optimistic local updates, status grouping, and the new-order sound.
 * Consumed by every kitchen view (board, table) so behaviour is identical.
 */
export function useKitchenOrders(
  restaurantId: string,
  initialOrders: KitchenOrder[]
) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const sound = useAudioAlert();
  const play = sound.play;

  useEffect(() => {
    const supabase = createClient();
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
              toast.success(
                `New order from table ${(data as { table: { table_number: string } }).table.table_number}`
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Partial<KitchenOrder>;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
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
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    },
    []
  );

  const ordersByStatus = useCallback(
    (statuses: OrderStatus[]) =>
      orders
        .filter((o) => statuses.includes(o.status))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [orders]
  );

  const activeOrders = orders.filter((o) => ACTIVE.includes(o.status));
  const oldest = activeOrders.reduce<KitchenOrder | null>(
    (m, o) => (!m || new Date(o.created_at) < new Date(m.created_at) ? o : m),
    null
  );

  return { orders, activeOrders, oldest, handleLocalUpdate, ordersByStatus, sound };
}

export { ACTIVE as ACTIVE_STATUSES };
