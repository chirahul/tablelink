import { createClient } from "@/lib/supabase/server";
import { getSubscriptionState } from "@/lib/plans";
import type { Category, MenuItem, Restaurant, Table } from "./types";

export type MenuData = {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  table: Table | null;
};

// An item counts as "highly reordered" if it has sold at least this many units
// AND ranks in the top fraction of items by units sold. The floor avoids
// flagging items as popular on a brand-new restaurant with almost no history.
const POPULAR_MIN_UNITS = 5;
const POPULAR_TOP_FRACTION = 0.25;

/** Returns the set of menu_item_ids that are highly reordered for a restaurant. */
async function fetchPopularItemIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("order_items")
    .select("menu_item_id, quantity, orders!inner(restaurant_id)")
    .eq("orders.restaurant_id", restaurantId);

  if (!data || data.length === 0) return new Set();

  const counts = new Map<string, number>();
  for (const row of data as { menu_item_id: string; quantity: number }[]) {
    counts.set(
      row.menu_item_id,
      (counts.get(row.menu_item_id) ?? 0) + (row.quantity ?? 0)
    );
  }

  const ranked = [...counts.entries()]
    .filter(([, units]) => units >= POPULAR_MIN_UNITS)
    .sort((a, b) => b[1] - a[1]);

  const topN = Math.ceil(ranked.length * POPULAR_TOP_FRACTION);
  return new Set(ranked.slice(0, topN).map(([id]) => id));
}

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

  // Subscription gate: an expired restaurant's menu goes offline.
  if (!getSubscriptionState(restaurant as Restaurant).isLive) return null;

  const [{ data: categories }, { data: items }, popularIds] = await Promise.all([
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
    fetchPopularItemIds(supabase, restaurant.id),
  ]);

  const itemsWithPopularity = ((items ?? []) as MenuItem[]).map((item) => ({
    ...item,
    is_popular: popularIds.has(item.id),
  }));

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
    items: itemsWithPopularity,
    table,
  };
}
