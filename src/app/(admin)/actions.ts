"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/is-super-admin";

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

export async function setRestaurantActive(
  restaurantId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
  } catch {
    return { success: false, error: "Super admin access required" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurants")
    .update({ is_active: isActive })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/restaurants");
  return {
    success: true,
    message: isActive ? "Restaurant activated" : "Restaurant suspended",
  };
}
