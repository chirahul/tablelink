"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { logout } from "@/app/(auth)/actions";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import logo from "@/assets/logo-wide.png";

type Props = {
  userEmail: string | null;
  initialCollapsed: boolean;
  children: React.ReactNode;
};

export function DashboardShell({ userEmail, initialCollapsed, children }: Props) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `sidebar_collapsed=${next ? "1" : "0"}; path=/; max-age=31536000`;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — fixed full height; nav scrolls, logout pinned */}
      <aside
        className={cn(
          "hidden md:flex md:fixed md:inset-y-0 md:left-0 z-30 flex-col border-r bg-muted/20 transition-[width] duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b shrink-0 px-3 gap-2",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" aria-label={APP_NAME}>
              <Image src={logo} alt={APP_NAME} className="h-11 w-auto rounded-md" priority />
            </Link>
          )}
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <SidebarNav collapsed={collapsed} />

        <div className="border-t p-3 shrink-0">
          {!collapsed && userEmail && (
            <p className="text-xs text-muted-foreground truncate px-2 mb-2">
              {userEmail}
            </p>
          )}
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="Logout"
              className={cn("rounded-xl", collapsed ? "w-full px-0" : "w-full justify-start")}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-[margin] duration-200",
          collapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MobileNav userEmail={userEmail} />
            <Link href="/dashboard" aria-label={APP_NAME}>
              <Image src={logo} alt={APP_NAME} className="h-9 w-auto rounded-md" />
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
