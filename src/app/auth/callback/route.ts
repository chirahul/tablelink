import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** New staff signing in with Google have no restaurant yet (only the
 *  email/password sign-up creates one). Provision a minimal one so the
 *  dashboard works. Customer sign-ins (next != /dashboard) skip this. */
async function ensureRestaurant(user: User): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) return;

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    "My Restaurant";
  const base = slugify(name) || "restaurant";
  let slug = base;
  let n = 1;
  while (true) {
    const { data } = await admin
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    n += 1;
    slug = `${base}-${n}`;
  }

  await admin.from("restaurants").insert({
    name,
    slug,
    email: user.email ?? null,
    owner_id: user.id,
  });
}

/**
 * OAuth (Google) callback. Exchanges the auth code for a session, then
 * redirects to `next` (validated as a relative path). Shared by staff login
 * and customer sign-in.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Staff path → make sure they own a restaurant.
      if (next.startsWith("/dashboard") && data.user) {
        await ensureRestaurant(data.user);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
