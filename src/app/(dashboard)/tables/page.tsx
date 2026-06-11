import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { TablesManager } from "./tables-manager";
import type { Table } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tables & QR Codes",
};

export default async function TablesPage() {
  const restaurant = await getCurrentRestaurant();
  const supabase = await createClient();

  const [{ data: tables }, { data: scanRows }, { data: orderRows }] =
    await Promise.all([
      supabase
        .from("tables")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true })
        .order("table_number", { ascending: true }),
      supabase
        .from("menu_events")
        .select("table_id")
        .eq("restaurant_id", restaurant.id)
        .eq("source", "qr")
        .limit(10000),
      supabase
        .from("orders")
        .select("table_id")
        .eq("restaurant_id", restaurant.id)
        .limit(10000),
    ]);

  // Build per-table { scans, orders } maps.
  const stats: Record<string, { scans: number; orders: number }> = {};
  const bump = (id: string | null, key: "scans" | "orders") => {
    if (!id) return;
    stats[id] ??= { scans: 0, orders: 0 };
    stats[id][key] += 1;
  };
  (scanRows ?? []).forEach((r) => bump(r.table_id, "scans"));
  (orderRows ?? []).forEach((r) => bump(r.table_id, "orders"));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 tracking-tight">
        Tables &amp; QR Codes
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Add tables and download printable QR codes. Customers scan the QR to
        open the menu for that specific table.
      </p>
      <TablesManager
        tables={(tables ?? []) as Table[]}
        stats={stats}
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
