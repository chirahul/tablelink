import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { MenuItemsManager } from "./menu-items-manager";
import type { Category, MenuItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Menu",
};

export default async function MenuManagementPage() {
  const restaurant = await getCurrentRestaurant();
  const supabase = await createClient();

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-sm text-muted-foreground">
            Manage your menu items, variants, and add-ons.
          </p>
        </div>
        <Link href="/menu/categories">
          <Button variant="outline">Manage Categories</Button>
        </Link>
      </div>

      <MenuItemsManager
        items={(items ?? []) as MenuItem[]}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  );
}
