import { createClient } from "@/lib/supabase/server";

/**
 * Checks if the currently-logged-in user is a super admin.
 * Super admins are configured via the SUPER_ADMIN_EMAILS env var
 * (comma-separated list of email addresses).
 */
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;

  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(user.email.toLowerCase());
}

export async function requireSuperAdmin(): Promise<void> {
  const ok = await isSuperAdmin();
  if (!ok) {
    throw new Error("Super admin access required");
  }
}
