"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderWithItems } from "@/lib/types";

export function useRealtimeOrders(restaurantId: string | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!restaurantId) return;

    // Subscribe to order changes
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          // Refetch orders on any change
          fetchOrders();
        }
      )
      .subscribe();

    // Initial fetch
    fetchOrders();

    async function fetchOrders() {
      const { data } = await supabase
        .from("orders")
        .select(
          `*, order_items(*, menu_item:menu_items(*)), table:tables(*)`
        )
        .eq("restaurant_id", restaurantId!)
        .in("status", ["pending", "confirmed", "preparing", "ready"])
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data as unknown as OrderWithItems[]);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return orders;
}
