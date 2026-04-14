import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { KitchenBoard } from "@/components/kitchen/kitchen-board";
import type { KitchenOrder } from "@/components/kitchen/order-ticket";

export const metadata: Metadata = {
  title: "Kitchen",
};

export default async function KitchenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!restaurant) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No restaurant found.</p>
      </div>
    );
  }

  // Fetch today's active orders and a small tail of served orders from today.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `*, order_items(*, menu_item:menu_items(id, name, is_veg)), table:tables(id, table_number)`
    )
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", todayStart.toISOString())
    .in("status", ["pending", "confirmed", "preparing", "ready", "served"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <KitchenBoard
        restaurantId={restaurant.id}
        initialOrders={(orders ?? []) as unknown as KitchenOrder[]}
      />
    </div>
  );
}
