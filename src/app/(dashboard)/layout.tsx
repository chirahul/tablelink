import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { logout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/mobile-nav";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/menu", label: "Menu" },
  { href: "/tables", label: "Tables & QR" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
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
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="font-bold text-lg">
            {APP_NAME}
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 space-y-2">
          <p className="text-xs text-muted-foreground truncate px-2">
            {user.email}
          </p>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <div className="flex items-center gap-2">
            <MobileNav userEmail={user.email ?? null} />
            <Link href="/dashboard" className="font-bold text-lg">
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
