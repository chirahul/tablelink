"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MenuAddon, MenuVariant, RestaurantSettings } from "@/lib/types";

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

async function requireRestaurantId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  return restaurant?.id ?? null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

/**
 * Uploads an image to the menu-images bucket. Returns the public URL.
 * Files are stored at <restaurantId>/<timestamp>-<filename>.
 */
export async function uploadImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be under 5MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${restaurantId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  // Use admin client for upload so it works even if bucket is private
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("menu-images")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data } = admin.storage.from("menu-images").getPublicUrl(path);
  return { success: true, data: { url: data.publicUrl } };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!name) return { success: false, error: "Category name is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    restaurant_id: restaurantId,
    name,
    description,
    sort_order,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  revalidatePath("/menu/categories");
  return { success: true };
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const is_active = formData.get("is_active") === "on";

  if (!name) return { success: false, error: "Category name is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, description, sort_order, is_active })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  revalidatePath("/menu/categories");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  revalidatePath("/menu/categories");
  return { success: true };
}

// ============================================================
// MENU ITEMS
// ============================================================

type MenuItemInput = {
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  tags: string[];
  variants: MenuVariant[] | null;
  addons: MenuAddon[] | null;
  sort_order: number;
};

function parseMenuItemInput(formData: FormData): MenuItemInput | { error: string } {
  const category_id = String(formData.get("category_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = Number(formData.get("price") ?? 0);
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const is_veg = formData.get("is_veg") === "on" || formData.get("is_veg") === "true";
  const is_available =
    formData.get("is_available") === "on" || formData.get("is_available") === "true";
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const variantsJson = String(formData.get("variants") ?? "");
  const addonsJson = String(formData.get("addons") ?? "");
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!category_id) return { error: "Category is required" };
  if (!name) return { error: "Name is required" };
  if (!priceRaw || priceRaw < 0) return { error: "Valid price is required" };

  let variants: MenuVariant[] | null = null;
  let addons: MenuAddon[] | null = null;

  try {
    if (variantsJson) {
      const parsed = JSON.parse(variantsJson);
      if (Array.isArray(parsed) && parsed.length > 0) variants = parsed;
    }
    if (addonsJson) {
      const parsed = JSON.parse(addonsJson);
      if (Array.isArray(parsed) && parsed.length > 0) addons = parsed;
    }
  } catch {
    return { error: "Variants/addons JSON is invalid" };
  }

  return {
    category_id,
    name,
    description,
    price: priceRaw,
    image_url,
    is_veg,
    is_available,
    tags,
    variants,
    addons,
    sort_order,
  };
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const parsed = parseMenuItemInput(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: restaurantId,
    ...parsed,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function updateMenuItem(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseMenuItemInput(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update(parsed)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function toggleMenuItemAvailability(
  id: string,
  is_available: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function duplicateMenuItem(id: string): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (!item) return { success: false, error: "Item not found" };

  const {
    id: _id,
    created_at: _c,
    updated_at: _u,
    ...rest
  } = item as Record<string, unknown>;
  const { error } = await supabase
    .from("menu_items")
    .insert({ ...rest, name: `${item.name} (copy)` });
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

/** Persist a new ordering by writing each id's index to sort_order. */
export async function reorderMenuItems(ids: string[]): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, idx) =>
      supabase
        .from("menu_items")
        .update({ sort_order: idx })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { success: false, error: failed.error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, idx) =>
      supabase
        .from("categories")
        .update({ sort_order: idx })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { success: false, error: failed.error.message };

  revalidatePath("/menu");
  revalidatePath("/menu/categories");
  return { success: true };
}

export async function bulkSetMenuItemsAvailability(
  ids: string[],
  is_available: boolean
): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };
  if (ids.length === 0) return { success: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available })
    .in("id", ids)
    .eq("restaurant_id", restaurantId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function bulkDeleteMenuItems(
  ids: string[]
): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };
  if (ids.length === 0) return { success: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .in("id", ids)
    .eq("restaurant_id", restaurantId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

// ============================================================
// TABLES
// ============================================================

export async function createTable(formData: FormData): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const table_number = String(formData.get("table_number") ?? "").trim();
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  if (!table_number) {
    return { success: false, error: "Table number is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tables").insert({
    restaurant_id: restaurantId,
    table_number,
    capacity,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/tables");
  return { success: true };
}

export async function deleteTable(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tables").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/tables");
  return { success: true };
}

export async function updateTable(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const table_number = String(formData.get("table_number") ?? "").trim();
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  if (!table_number) {
    return { success: false, error: "Table number is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tables")
    .update({ table_number, capacity })
    .eq("id", id)
    .eq("restaurant_id", restaurantId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/tables");
  return { success: true };
}

export async function setTableActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tables")
    .update({ is_active })
    .eq("id", id)
    .eq("restaurant_id", restaurantId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/tables");
  return { success: true };
}

export async function duplicateTable(id: string): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data: table } = await supabase
    .from("tables")
    .select("table_number, capacity")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (!table) return { success: false, error: "Table not found" };

  const { error } = await supabase.from("tables").insert({
    restaurant_id: restaurantId,
    table_number: `${table.table_number} (copy)`,
    capacity: table.capacity,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/tables");
  return { success: true };
}

export async function reorderTables(ids: string[]): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, idx) =>
      supabase
        .from("tables")
        .update({ sort_order: idx })
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { success: false, error: failed.error.message };

  revalidatePath("/tables");
  return { success: true };
}

// ============================================================
// RESTAURANT SETTINGS
// ============================================================

export async function updateRestaurantSettings(
  formData: FormData
): Promise<ActionResult> {
  const restaurantId = await requireRestaurantId();
  if (!restaurantId) return { success: false, error: "Not authenticated" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const upi_id = String(formData.get("upi_id") ?? "").trim() || null;
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  const cover_image_url =
    String(formData.get("cover_image_url") ?? "").trim() || null;
  const upi_qr_image_url =
    String(formData.get("upi_qr_image_url") ?? "").trim() || null;
  const tax_rate = Number(formData.get("tax_rate") ?? 0);
  const currency = String(formData.get("currency") ?? "INR").trim() || "INR";
  const gst_number = String(formData.get("gst_number") ?? "").trim() || null;
  const timezone = String(formData.get("timezone") ?? "").trim() || null;
  const google_maps_url =
    String(formData.get("google_maps_url") ?? "").trim() || null;
  const is_active = formData.get("is_active") !== "false"; // default open
  const slug = slugify(String(formData.get("slug") ?? ""));

  const social_links = {
    instagram: String(formData.get("social_instagram") ?? "").trim() || undefined,
    facebook: String(formData.get("social_facebook") ?? "").trim() || undefined,
    website: String(formData.get("social_website") ?? "").trim() || undefined,
  };

  // opening_hours arrives as a JSON string from the editor (optional).
  let opening_hours: Record<string, { open: string; close: string }> | undefined;
  const ohRaw = formData.get("opening_hours");
  if (typeof ohRaw === "string" && ohRaw.trim()) {
    try {
      opening_hours = JSON.parse(ohRaw);
    } catch {
      return { success: false, error: "Invalid opening hours" };
    }
  }

  if (!name) return { success: false, error: "Restaurant name is required" };
  if (!slug) return { success: false, error: "Menu link can't be empty" };

  const settings: RestaurantSettings = {
    currency,
    tax_rate: Math.max(0, Math.min(100, tax_rate)),
    accept_online_payment: !!upi_id || !!upi_qr_image_url,
  };

  const supabase = await createClient();

  // Menu link (slug) must be unique across restaurants.
  const { data: clash } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .neq("id", restaurantId)
    .maybeSingle();
  if (clash) {
    return {
      success: false,
      error: "That menu link is already taken — try another.",
    };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      name,
      slug,
      description,
      address,
      phone,
      email,
      upi_id,
      logo_url,
      cover_image_url,
      upi_qr_image_url,
      gst_number,
      timezone,
      google_maps_url,
      social_links,
      is_active,
      settings,
      ...(opening_hours ? { opening_hours } : {}),
    })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true, message: "Settings saved" };
}
