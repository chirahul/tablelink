"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/**
 * Seeds sample categories, menu items, and tables into the logged-in user's
 * restaurant. Idempotent: re-running it won't duplicate data.
 */
export async function seedSampleData(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not logged in." };
  }

  const admin = createAdminClient();

  // Find the user's restaurant
  const { data: restaurant, error: rErr } = await admin
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (rErr || !restaurant) {
    return { success: false, error: "Restaurant not found for this user." };
  }

  // Check if sample data already exists
  const { count: existingCount } = await admin
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  if (existingCount && existingCount > 0) {
    return {
      success: false,
      error: "You already have menu data. Delete existing menu first.",
    };
  }

  // Insert categories
  const categoriesToInsert = [
    { name: "Starters", sort_order: 1 },
    { name: "Main Course", sort_order: 2 },
    { name: "Beverages", sort_order: 3 },
    { name: "Desserts", sort_order: 4 },
  ].map((c) => ({ ...c, restaurant_id: restaurant.id }));

  const { data: categories, error: cErr } = await admin
    .from("categories")
    .insert(categoriesToInsert)
    .select();

  if (cErr || !categories) {
    return { success: false, error: `Failed to create categories: ${cErr?.message}` };
  }

  const [starters, mains, beverages, desserts] = categories;

  // Insert menu items
  const items = [
    // Starters
    {
      category_id: starters.id,
      name: "Paneer Tikka",
      description: "Marinated cottage cheese grilled to perfection",
      price: 249,
      is_veg: true,
      tags: ["bestseller", "spicy"],
      variants: [
        { name: "Half", price: 149 },
        { name: "Full", price: 249 },
      ],
      addons: [{ name: "Extra Mint Chutney", price: 20 }],
    },
    {
      category_id: starters.id,
      name: "Chicken Wings",
      description: "Crispy fried chicken wings with hot sauce",
      price: 299,
      is_veg: false,
      tags: ["spicy"],
      variants: null,
      addons: [{ name: "Extra Sauce", price: 30 }],
    },
    {
      category_id: starters.id,
      name: "Veg Spring Rolls",
      description: "Crispy rolls stuffed with mixed vegetables",
      price: 179,
      is_veg: true,
      tags: ["new"],
      variants: null,
      addons: null,
    },
    // Main Course
    {
      category_id: mains.id,
      name: "Butter Chicken",
      description: "Creamy tomato-based chicken curry",
      price: 349,
      is_veg: false,
      tags: ["bestseller"],
      variants: [
        { name: "Half", price: 199 },
        { name: "Full", price: 349 },
      ],
      addons: [{ name: "Extra Butter Naan", price: 40 }],
    },
    {
      category_id: mains.id,
      name: "Dal Makhani",
      description: "Slow-cooked black lentils in a rich creamy gravy",
      price: 249,
      is_veg: true,
      tags: ["bestseller"],
      variants: null,
      addons: [{ name: "Extra Rice", price: 60 }],
    },
    {
      category_id: mains.id,
      name: "Veg Biryani",
      description: "Fragrant basmati rice with mixed vegetables and spices",
      price: 229,
      is_veg: true,
      tags: [],
      variants: [
        { name: "Half", price: 139 },
        { name: "Full", price: 229 },
      ],
      addons: [{ name: "Extra Raita", price: 30 }],
    },
    // Beverages
    {
      category_id: beverages.id,
      name: "Masala Chai",
      description: "Traditional Indian spiced tea",
      price: 49,
      is_veg: true,
      tags: [],
      variants: null,
      addons: null,
    },
    {
      category_id: beverages.id,
      name: "Cold Coffee",
      description: "Chilled coffee blended with ice cream",
      price: 129,
      is_veg: true,
      tags: ["bestseller"],
      variants: null,
      addons: [{ name: "Extra Shot", price: 30 }],
    },
    {
      category_id: beverages.id,
      name: "Fresh Lime Soda",
      description: "Refreshing lime with soda water",
      price: 79,
      is_veg: true,
      tags: [],
      variants: [
        { name: "Sweet", price: 79 },
        { name: "Salt", price: 79 },
      ],
      addons: null,
    },
    // Desserts
    {
      category_id: desserts.id,
      name: "Gulab Jamun",
      description: "Soft milk-solid dumplings soaked in sugar syrup",
      price: 99,
      is_veg: true,
      tags: [],
      variants: null,
      addons: null,
    },
    {
      category_id: desserts.id,
      name: "Brownie with Ice Cream",
      description: "Warm chocolate brownie topped with vanilla ice cream",
      price: 199,
      is_veg: true,
      tags: ["bestseller"],
      variants: null,
      addons: [{ name: "Extra Scoop", price: 50 }],
    },
  ].map((i) => ({ ...i, restaurant_id: restaurant.id }));

  const { error: iErr } = await admin.from("menu_items").insert(items);
  if (iErr) {
    return { success: false, error: `Failed to create items: ${iErr.message}` };
  }

  // Insert tables
  const tables = [
    { table_number: "T1", capacity: 2 },
    { table_number: "T2", capacity: 2 },
    { table_number: "T3", capacity: 4 },
    { table_number: "T4", capacity: 4 },
    { table_number: "T5", capacity: 6 },
    { table_number: "T6", capacity: 8 },
  ].map((t) => ({ ...t, restaurant_id: restaurant.id }));

  const { error: tErr } = await admin.from("tables").insert(tables);
  if (tErr) {
    return { success: false, error: `Failed to create tables: ${tErr.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/menu");

  return {
    success: true,
    message: `Added 4 categories, 11 menu items, and 6 tables to ${restaurant.name}.`,
  };
}
