import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/menu", label: "Menu" },
  { href: "/tables", label: "Tables & QR" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
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
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center border-b px-6 md:hidden">
          <Link href="/dashboard" className="font-bold text-lg">
            {APP_NAME}
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
