import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "./types";

/**
 * Returns the restaurant owned by the currently-logged-in user.
 * Throws if no user or no restaurant exists.
 */
export async function getCurrentRestaurant(): Promise<Restaurant> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    throw new Error("Restaurant not found for this user");
  }

  return restaurant as Restaurant;
}
