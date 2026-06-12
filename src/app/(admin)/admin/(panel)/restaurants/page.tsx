import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { RestaurantsList } from "./restaurants-list";
import type { Restaurant } from "@/lib/types";

export const metadata: Metadata = {
  title: "Manage Restaurants",
};

export default async function ManageRestaurantsPage() {
  const admin = createAdminClient();

  const { data: restaurants } = await admin
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch order stats per restaurant
  const ids = (restaurants ?? []).map((r) => r.id);
  const { data: orders } =
    ids.length > 0
      ? await admin
          .from("orders")
          .select("restaurant_id, total")
          .in("restaurant_id", ids)
      : { data: [] };

  const statsByRestaurant = new Map<
    string,
    { order_count: number; revenue: number }
  >();
  for (const id of ids) {
    statsByRestaurant.set(id, { order_count: 0, revenue: 0 });
  }
  for (const o of orders ?? []) {
    const s = statsByRestaurant.get(o.restaurant_id);
    if (s) {
      s.order_count += 1;
      s.revenue += Number(o.total);
    }
  }

  const withStats = (restaurants ?? []).map((r) => ({
    ...(r as Restaurant),
    stats: statsByRestaurant.get(r.id) ?? { order_count: 0, revenue: 0 },
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">All Restaurants</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Activate or suspend restaurants. Suspended restaurants won&apos;t
        appear in customer menus.
      </p>
      <RestaurantsList restaurants={withStats} />
    </div>
  );
}
