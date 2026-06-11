import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import logo from "@/assets/logo.png";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-background to-background" />

      <Link
        href="/"
        className="mb-8 hover:opacity-80 transition-opacity"
        aria-label={APP_NAME}
      >
        <Image
          src={logo}
          alt={APP_NAME}
          priority
          className="w-40 h-auto rounded-2xl shadow-sm"
        />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
}
