"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/menu", label: "Menu" },
  { href: "/tables", label: "Tables & QR" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

type Props = {
  userEmail: string | null;
};

export function MobileNav({ userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="font-bold text-lg">{APP_NAME}</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {userEmail && (
            <div className="border-t px-6 py-3">
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
