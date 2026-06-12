"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  CreditCard,
  Receipt,
  LifeBuoy,
  ScrollText,
  Activity,
  Flag,
  Server,
  Database,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  soon?: boolean;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/restaurants", label: "Restaurants", icon: Store },
      { label: "Users", icon: Users, soon: true },
      { label: "Orders", icon: ShoppingBag, soon: true },
      { label: "Menus", icon: UtensilsCrossed, soon: true },
      { label: "Tables & QR", icon: QrCode, soon: true },
    ],
  },
  {
    title: "Analytics & Billing",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { label: "Billing", icon: Receipt, soon: true },
    ],
  },
  {
    title: "Support & Logs",
    items: [
      { label: "Support Center", icon: LifeBuoy, soon: true },
      { label: "Audit Logs", icon: ScrollText, soon: true },
      { label: "System Health", icon: Activity, soon: true },
    ],
  },
  {
    title: "Developer Tools",
    items: [
      { label: "Feature Flags", icon: Flag, soon: true },
      { label: "Environment", icon: Server, soon: true },
      { label: "Database Tools", icon: Database, soon: true },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", icon: Settings, soon: true }],
  },
];

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              const base =
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200";
              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    className={cn(base, "text-muted-foreground/50 cursor-default select-none")}
                    title="Coming soon"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/40 border border-current/30 rounded px-1 py-px">
                      Soon
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-px">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
