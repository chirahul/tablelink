"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function signUp(formData: FormData): Promise<ActionResult> {
  const restaurantName = String(formData.get("restaurant_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!restaurantName || !email || !password) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters.",
    };
  }

  const supabase = await createClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return {
      success: false,
      error: "Account created, but no session returned. Please log in.",
    };
  }

  // 2. Use the admin client for restaurant creation.
  // This bypasses RLS so it works regardless of whether email confirmation
  // is enabled (no session is guaranteed after signUp).
  const admin = createAdminClient();

  // 3. Create a unique slug for the restaurant
  const baseSlug = slugify(restaurantName) || "restaurant";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existing } = await admin
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  // 4. Create the restaurant row (bypasses RLS via service role)
  const { error: restaurantError } = await admin
    .from("restaurants")
    .insert({
      name: restaurantName,
      slug,
      email,
      phone: phone || null,
      owner_id: authData.user.id,
    });

  if (restaurantError) {
    return {
      success: false,
      error: `Account created but failed to create restaurant: ${restaurantError.message}`,
    };
  }

  // If email confirmation is ON, there's no session yet. Send to login.
  if (!authData.session) {
    redirect("/login?confirmed=check-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectToRaw = String(formData.get("redirect_to") || "").trim();

  if (!email || !password) {
    return { success: false, error: "Please enter email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  // Honor the ?redirect= query param if it's a safe same-origin path.
  const safeRedirect =
    redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : "/dashboard";
  redirect(safeRedirect);
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { success: false, error: "Please enter your email." };
  }

  const supabase = await createClient();

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || "https://tablelink-amber.vercel.app";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") || "");

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
