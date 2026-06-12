import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logout } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { AdminNav } from "./admin-nav";
import logo from "@/assets/logo-wide.png";

const AdminBadge = () => (
  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
    Admin
  </span>
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isSuperAdmin();
  if (!ok) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 z-30 w-64 flex-col border-r bg-muted/20">
        <div className="flex h-16 items-center gap-2 border-b px-4 shrink-0">
          <Link href="/admin" className="flex items-center" aria-label={`${APP_NAME} Admin`}>
            <Image src={logo} alt={APP_NAME} className="h-9 w-auto" priority />
          </Link>
          <span className="ml-auto">
            <AdminBadge />
          </span>
        </div>

        <AdminNav />

        <div className="border-t p-3 shrink-0 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my restaurant
          </Link>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden bg-background/80 backdrop-blur-xl">
          <Link href="/admin" className="flex items-center gap-2" aria-label={`${APP_NAME} Admin`}>
            <Image src={logo} alt={APP_NAME} className="h-8 w-auto" />
            <AdminBadge />
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Logout
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
