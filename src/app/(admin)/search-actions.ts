"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/is-super-admin";

export type SearchResults = {
  restaurants: { id: string; name: string; slug: string; status: string }[];
  orders: { id: string; order_number: string; restaurant: string; total: number; status: string }[];
};

const EMPTY: SearchResults = { restaurants: [], orders: [] };

export async function searchAdmin(query: string): Promise<SearchResults> {
  try {
    await requireSuperAdmin();
  } catch {
    return EMPTY;
  }

  // Strip characters that would break the PostgREST or()/ilike filter string.
  const term = query.replace(/[%,()*]/g, " ").trim();
  if (term.length < 1) return EMPTY;
  const like = `%${term}%`;

  const admin = createAdminClient();
  const [{ data: restaurants }, { data: orders }] = await Promise.all([
    admin
      .from("restaurants")
      .select("id, name, slug, subscription_status")
      .or(`name.ilike.${like},slug.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .limit(6),
    admin
      .from("orders")
      .select("id, order_number, total, status, restaurant:restaurants(name)")
      .ilike("order_number", like)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    restaurants: (restaurants ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: r.subscription_status,
    })),
    orders: (orders ?? []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      total: Number(o.total),
      status: o.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      restaurant: (o.restaurant as any)?.name ?? "",
    })),
  };
}
