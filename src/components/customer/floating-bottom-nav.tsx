"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, ShoppingCart, type LucideIcon } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
};

type Props = {
  /** Link back to this restaurant's menu, e.g. `/menu/spice-route?table=abc`. */
  menuHref: string;
};

/**
 * Glassmorphism pill nav for the diner journey. Mobile-only — the desktop
 * customer view uses the inline cart bar instead. Only renders destinations
 * that actually exist for an anonymous diner (Menu, Cart); Orders/Profile are
 * intentionally omitted until customer accounts exist (no dead links).
 */
export function FloatingBottomNav({ menuHref }: Props) {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  const tabs: Tab[] = [
    {
      label: "Menu",
      href: menuHref,
      icon: UtensilsCrossed,
      active: pathname.startsWith("/menu"),
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      active: pathname === "/cart",
      badge: itemCount,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(86%,320px)]
                 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg
                 px-8 py-2.5 flex justify-between items-center"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "relative flex flex-col items-center gap-1 transition-colors active:scale-95 duration-150",
              tab.active
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={tab.active ? 2.5 : 2} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {tab.badge ? (
              <span
                className="absolute -top-1.5 right-1 min-w-4 h-4 px-1 rounded-full bg-primary
                           text-primary-foreground text-[9px] font-bold leading-none
                           flex items-center justify-center border-2 border-background"
              >
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
