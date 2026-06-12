import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { GoogleButton } from "@/components/shared/google-button";
import logo from "@/assets/logo-wide.png";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  // Already a signed-in super admin? Go straight to the panel.
  if (await isSuperAdmin()) {
    redirect("/admin");
  }
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[radial-gradient(120%_80%_at_50%_0%,#FBF7F0_0%,#EFE5D2_60%,#E3D4B5_100%)]">
      <Image src={logo} alt={APP_NAME} priority className="w-52 h-auto mb-6" />

      <div className="w-full max-w-sm rounded-2xl border bg-card/85 backdrop-blur-sm shadow-lg p-6">
        <div className="flex items-center gap-2 justify-center mb-1.5">
          <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Developer Control Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Restricted access. Sign in with an authorized admin account.
        </p>

        {error && (
          <div className="rounded-xl bg-destructive-container border border-border p-3 text-sm text-destructive mb-4">
            Sign-in failed. Please try again.
          </div>
        )}

        <GoogleButton next="/admin" label="Sign in to Admin" />

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Access is limited to addresses on the platform admin allow-list. If you
          reached this by mistake,{" "}
          <Link href="/login" className="underline underline-offset-2">
            go to the restaurant login
          </Link>
          .
        </p>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
}
