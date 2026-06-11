import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { logout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — fixed full height (reliable on iPad/iOS); nav
          scrolls internally, logout stays pinned at the bottom */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 z-30 w-64 flex-col border-r bg-muted/20">
        <div className="flex h-16 items-center border-b px-6 shrink-0">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight">
            {APP_NAME}
          </Link>
        </div>
        <SidebarNav />
        <div className="border-t p-4 space-y-2 shrink-0">
          <p className="text-xs text-muted-foreground truncate px-3">
            {user.email}
          </p>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-xl"
            >
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MobileNav userEmail={user.email ?? null} />
            <Link href="/dashboard" className="font-bold text-lg tracking-tight">
              {APP_NAME}
            </Link>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Logout
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
