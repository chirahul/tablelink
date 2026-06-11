import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ShoppingBag,
  IndianRupee,
  ScanLine,
  Eye,
  Printer,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import {
  OnboardingWizard,
  type OnboardingStatus,
} from "@/components/dashboard/onboarding-wizard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const rid = restaurant?.id;

  const count = (p: PromiseLike<{ count: number | null }>) => p;
  const [
    { count: ordersCount },
    { data: todayOrders },
    { count: viewsToday },
    { count: scansToday },
    { count: categoriesCount },
    { count: menuItemsCount },
    { count: tablesCount },
    { count: totalOrders },
    { data: recentOrders },
  ] = await Promise.all([
    rid
      ? count(
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", rid)
            .gte("created_at", todayStart.toISOString())
        )
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("orders")
          .select("total")
          .eq("restaurant_id", rid)
          .neq("status", "cancelled")
          .gte("created_at", todayStart.toISOString())
      : Promise.resolve({ data: [] }),
    rid
      ? supabase
          .from("menu_events")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
          .gte("created_at", todayStart.toISOString())
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("menu_events")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
          .eq("source", "qr")
          .gte("created_at", todayStart.toISOString())
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("menu_items")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("tables")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", rid)
      : Promise.resolve({ count: 0 }),
    rid
      ? supabase
          .from("orders")
          .select("id, order_number, status, total, created_at")
          .eq("restaurant_id", rid)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const revenueToday = (todayOrders || []).reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  const onboardingStatus: OnboardingStatus = {
    hasCategories: (categoriesCount ?? 0) > 0,
    hasMenuItems: (menuItemsCount ?? 0) > 0,
    hasTables: (tablesCount ?? 0) > 0,
    hasReceivedOrder: (totalOrders ?? 0) > 0,
    menuSlug: restaurant?.slug ?? "",
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://thetablelynk.com";
  const menuLink = restaurant ? `${baseUrl}/menu/${restaurant.slug}` : "";
  const menuQr = menuLink
    ? await QRCode.toDataURL(menuLink, { width: 240, margin: 1 })
    : null;

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {restaurant?.name ?? "Dashboard"}
          </h1>
          {restaurant && (
            <p className="text-sm text-muted-foreground mt-1">
              Live at{" "}
              <Link
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className="underline font-mono"
              >
                /menu/{restaurant.slug}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {restaurant && (
            <>
              <Link href={`/menu/${restaurant.slug}`} target="_blank">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" /> View Customer Menu
                </Button>
              </Link>
              <CopyLinkButton url={menuLink} />
            </>
          )}
        </div>
      </div>

      <OnboardingWizard status={onboardingStatus} />

      {/* Metrics */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Orders Today"
          value={ordersCount ?? 0}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(revenueToday)}
          icon={<IndianRupee className="w-4 h-4" />}
        />
        <StatCard
          label="QR Scans"
          value={scansToday ?? 0}
          sub="today"
          icon={<ScanLine className="w-4 h-4" />}
        />
        <StatCard
          label="Menu Views"
          value={viewsToday ?? 0}
          sub="today"
          icon={<Eye className="w-4 h-4" />}
        />
      </div>

      {/* QR preview + recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Menu QR</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {menuQr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={menuQr}
                alt="Menu QR code"
                className="w-40 h-40 rounded-lg border bg-white"
              />
            ) : (
              <div className="w-40 h-40 rounded-lg bg-muted" />
            )}
            <Link href="/tables" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Printer className="w-4 h-4" /> Print table QR codes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link
              href="/orders"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="divide-y">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href="/orders"
                    className="flex items-center justify-between py-2.5 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {o.order_number}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold">
                        {formatCurrency(Number(o.total))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(o.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No orders yet — share your menu link to get your first order.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
