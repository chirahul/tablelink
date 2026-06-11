"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  ShoppingCart,
  ReceiptText,
  User,
  type LucideIcon,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
};

/**
 * Glassmorphism pill nav for the diner journey (mobile-only). Store-driven so
 * it works on any customer page. Guests see Menu + Cart; phone-signed-up
 * customers also get Orders + Profile (their own history / account).
 */
export function FloatingBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const slug = useCartStore((s) => s.restaurantSlug);
  const tableId = useCartStore((s) => s.tableId);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const menuHref = slug
    ? `/menu/${slug}${tableId ? `?table=${tableId}` : ""}`
    : "/";

  const tabs: Tab[] = [
    {
      label: "Menu",
      href: menuHref,
      icon: UtensilsCrossed,
      active: pathname.startsWith("/menu"),
    },
    ...(signedIn
      ? [
          {
            label: "Orders",
            href: "/account/orders",
            icon: ReceiptText,
            active: pathname.startsWith("/account/orders"),
          },
        ]
      : []),
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      active: pathname === "/cart",
      badge: itemCount,
    },
    ...(signedIn
      ? [
          {
            label: "Profile",
            href: "/account",
            icon: User,
            active: pathname === "/account",
          },
        ]
      : []),
  ];

  return (
    <nav
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[92%]
                 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg
                 px-8 py-2.5 inline-flex items-center justify-center gap-9"
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
                className="absolute -top-1.5 right-0 min-w-4 h-4 px-1 rounded-full bg-primary
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
