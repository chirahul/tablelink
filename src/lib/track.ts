import { createAdminClient } from "@/lib/supabase/admin";

type MenuEventInput = {
  restaurantId: string;
  tableId?: string | null;
  source: "qr" | "link" | "direct";
};

/**
 * Fire-and-forget log of a customer menu load. Used for the dashboard's
 * QR-scan / menu-view metrics and per-table scan counts. Uses the service-role
 * client (anonymous diners have no session) and never throws into the caller.
 */
export async function logMenuEvent({
  restaurantId,
  tableId,
  source,
}: MenuEventInput): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("menu_events").insert({
      restaurant_id: restaurantId,
      table_id: tableId ?? null,
      source,
    });
  } catch (err) {
    // Analytics must never break a customer's menu load.
    console.error("logMenuEvent failed", err);
  }
}
