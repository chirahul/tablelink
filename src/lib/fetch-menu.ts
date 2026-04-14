import { createClient } from "@/lib/supabase/server";
import type { Category, MenuItem, Restaurant, Table } from "./types";

export type MenuData = {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  table: Table | null;
};

export async function fetchMenuBySlug(
  slug: string,
  tableId?: string
): Promise<MenuData | null> {
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!restaurant) return null;

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
  ]);

  let table: Table | null = null;
  if (tableId) {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .eq("id", tableId)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle();
    table = data as Table | null;
  }

  return {
    restaurant: restaurant as Restaurant,
    categories: (categories ?? []) as Category[],
    items: (items ?? []) as MenuItem[],
    table,
  };
}
