"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/is-super-admin";
import type { PlanId } from "@/lib/plans";

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

async function guard(): Promise<boolean> {
  try {
    await requireSuperAdmin();
    return true;
  } catch {
    return false;
  }
}

function revalidateBilling() {
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
}

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

/** Activate a paid yearly subscription on the chosen plan (manual payment). */
export async function activateSubscription(
  restaurantId: string,
  plan: PlanId
): Promise<ActionResult> {
  if (!(await guard())) return { success: false, error: "Super admin access required" };

  const admin = createAdminClient();
  const now = new Date();
  const { error } = await admin
    .from("restaurants")
    .update({
      subscription_status: "active",
      plan,
      subscription_started_at: now.toISOString(),
      subscription_ends_at: new Date(now.getTime() + YEAR_MS).toISOString(),
      is_active: true,
    })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };
  revalidateBilling();
  return { success: true, message: "Subscription activated for 1 year" };
}

/** Extend the current subscription by another year (from its end, or now). */
export async function extendSubscription(restaurantId: string): Promise<ActionResult> {
  if (!(await guard())) return { success: false, error: "Super admin access required" };

  const admin = createAdminClient();
  const { data: r } = await admin
    .from("restaurants")
    .select("subscription_ends_at")
    .eq("id", restaurantId)
    .maybeSingle();

  const now = Date.now();
  const currentEnd = r?.subscription_ends_at ? new Date(r.subscription_ends_at).getTime() : 0;
  const base = currentEnd > now ? currentEnd : now;
  const { error } = await admin
    .from("restaurants")
    .update({
      subscription_status: "active",
      subscription_ends_at: new Date(base + YEAR_MS).toISOString(),
    })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };
  revalidateBilling();
  return { success: true, message: "Extended by 1 year" };
}

/** Mark a subscription expired (menu offline + owner paywall). */
export async function expireSubscription(restaurantId: string): Promise<ActionResult> {
  if (!(await guard())) return { success: false, error: "Super admin access required" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurants")
    .update({ subscription_status: "expired" })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };
  revalidateBilling();
  return { success: true, message: "Subscription marked expired" };
}

/** Start (or restart) a 3-day free trial. */
export async function resetTrial(restaurantId: string): Promise<ActionResult> {
  if (!(await guard())) return { success: false, error: "Super admin access required" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurants")
    .update({
      subscription_status: "trialing",
      plan: null,
      trial_ends_at: new Date(Date.now() + 3 * DAY_MS).toISOString(),
      subscription_ends_at: null,
    })
    .eq("id", restaurantId);

  if (error) return { success: false, error: error.message };
  revalidateBilling();
  return { success: true, message: "3-day trial started" };
}
