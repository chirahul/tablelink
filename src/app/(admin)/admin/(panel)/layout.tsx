import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell, HelpCircle, LogOut } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { AdminNav } from "../../admin-nav";
import { AdminSearch } from "@/components/admin/admin-search";
import { ThemeToggle } from "@/components/theme-toggle";
import logo from "@/assets/logo-wide.png";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }
  if (!(await isSuperAdmin())) {
    redirect("/dashboard");
  }

  const email = user.email ?? "admin@thetablelynk.com";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 z-30 w-64 flex-col border-r bg-muted/20">
        <div className="flex h-[68px] items-center border-b px-4 shrink-0">
          <Link href="/admin" className="flex flex-col" aria-label={`${APP_NAME} Admin`}>
            <Image src={logo} alt={APP_NAME} className="h-8 w-auto" priority />
            <span className="text-[10px] text-muted-foreground tracking-wide pl-0.5 -mt-0.5">
              Developer Control Panel
            </span>
          </Link>
        </div>

        <AdminNav />

        {/* User card */}
        <div className="border-t p-3 shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              SA
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Super Admin</div>
              <div className="text-[11px] text-muted-foreground truncate">{email}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Back to my restaurant"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Restaurant
            </Link>
            <form action={logout} className="flex-1">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full h-auto py-1.5 rounded-lg text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="ml-1.5">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b px-4 md:px-6 bg-background/80 backdrop-blur-xl">
          <Link href="/admin" className="md:hidden flex items-center" aria-label={`${APP_NAME} Admin`}>
            <Image src={logo} alt={APP_NAME} className="h-7 w-auto" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
            <AdminSearch />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle className="p-2" />
            <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="hidden sm:flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-sm" aria-label="Help">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-2 ml-1 border-l">
              <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                SA
              </span>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-semibold">Super Admin</div>
                <div className="text-[11px] text-muted-foreground">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>

        <footer className="border-t px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            System Status:
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-success font-medium">All Systems Operational</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
