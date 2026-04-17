import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  ChefHat,
  BarChart3,
  Settings,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/mobile-nav";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/tables", label: "Tables & QR", icon: QrCode },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

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
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/20">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight">
            {APP_NAME}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 space-y-2">
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
      <div className="flex-1 flex flex-col">
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
