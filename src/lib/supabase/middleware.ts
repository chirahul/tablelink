import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet, skip auth checks.
  // This prevents the middleware from crashing during pre-Supabase deploys.
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project") ||
    supabaseKey === "your-anon-key"
  ) {
    return supabaseResponse;
  }

  // Determine whether this route actually needs auth BEFORE hitting Supabase.
  // IMPORTANT: these must NOT accidentally match customer-facing pages.
  // Specifically, /menu/[slug] is the CUSTOMER menu; admin menu management
  // lives at exactly /menu and /menu/categories only.
  const pathname = request.nextUrl.pathname;

  const isAdminMenu =
    pathname === "/menu" || pathname === "/menu/categories";

  const protectedPrefixes = [
    "/dashboard",
    "/orders",
    "/tables",
    "/kitchen",
    "/analytics",
    "/settings",
    "/admin",
  ];

  const isProtected =
    isAdminMenu ||
    protectedPrefixes.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  // Public routes (landing, customer menu, login, etc.) never need the auth
  // network call. Skipping it keeps these pages up even if Supabase is down.
  if (!isProtected) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session - important for Server Components.
  // Race against a short timeout so a slow/unreachable Supabase fails fast
  // instead of hanging until Vercel kills the middleware (MIDDLEWARE_INVOCATION_TIMEOUT).
  let user = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), 3000)
      ),
    ]);
    user = result.data.user;
  } catch {
    // Treat as unauthenticated below; the redirect to /login is the safe default.
    user = null;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
