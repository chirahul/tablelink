import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_CONTACT } from "@/lib/plans";

export type BillingConfig = {
  qrUrl: string | null;
  upi: string;
  phone: string;
  email: string;
};

/**
 * Platform-level billing/payment details (QR + contact) shown to owners.
 * Stored in the singleton `platform_settings` row; falls back to defaults if
 * the table isn't present yet, so this never hard-breaks the billing pages.
 */
export async function getBillingConfig(): Promise<BillingConfig> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("platform_settings")
      .select("billing_qr_url, billing_upi, billing_phone, billing_email")
      .eq("id", 1)
      .maybeSingle();
    return {
      qrUrl: data?.billing_qr_url ?? null,
      upi: data?.billing_upi || BILLING_CONTACT.upi,
      phone: data?.billing_phone || BILLING_CONTACT.phone,
      email: data?.billing_email || BILLING_CONTACT.email,
    };
  } catch {
    return {
      qrUrl: null,
      upi: BILLING_CONTACT.upi,
      phone: BILLING_CONTACT.phone,
      email: BILLING_CONTACT.email,
    };
  }
}
