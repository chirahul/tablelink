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

  const { data: tables } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("table_number", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tables & QR Codes</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Add tables and download printable QR codes. Customers scan the QR to
        open the menu for that specific table.
      </p>
      <TablesManager
        tables={(tables ?? []) as Table[]}
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
