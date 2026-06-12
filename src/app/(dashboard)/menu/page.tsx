import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
  ]);

  const itemList = (items ?? []) as MenuItem[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Menu{" "}
            <span className="text-muted-foreground font-normal text-lg">
              ({itemList.length})
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your menu items, variants, and add-ons.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/menu/${restaurant.slug}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Preview Menu
            </Button>
          </Link>
          <Link href="/menu/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
      </div>

      <MenuItemsManager
        items={itemList}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  );
}
