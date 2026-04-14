import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { logout } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { isSuperAdmin } from "@/lib/is-super-admin";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/analytics", label: "Platform Analytics" },
];

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
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="font-bold text-lg">
            {APP_NAME}{" "}
            <span className="text-xs text-muted-foreground">Admin</span>
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

      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6 md:hidden">
          <Link href="/admin" className="font-bold text-lg">
            {APP_NAME} Admin
          </Link>
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
