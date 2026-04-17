import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { OrdersList } from "./orders-list";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Orders",
};

type Props = {
  searchParams: Promise<{ status?: OrderStatus | "all"; days?: string }>;
};

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Served", value: "served" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function OrdersPage({ searchParams }: Props) {
  const { status = "all", days = "1" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!restaurant) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-4">No restaurant found.</p>
      </div>
    );
  }

  const daysNum = Number(days) || 1;
  const since = new Date();
  since.setDate(since.getDate() - daysNum);

  let query = supabase
    .from("orders")
    .select(
      `id, order_number, status, payment_method, payment_status, total, created_at, customer_name, table:tables(table_number), order_items(id, quantity)`
    )
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") {
    if (status === "pending") {
      // 'Active' bucket: anything not yet served or cancelled
      query = query.in("status", ["pending", "confirmed"]);
    } else {
      query = query.eq("status", status);
    }
  }

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Showing last {daysNum} day{daysNum > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {[1, 7, 30].map((d) => (
            <Link
              key={d}
              href={`/orders?status=${status}&days=${d}`}
              className={`px-3 py-1 rounded-full border ${
                daysNum === d ? "bg-foreground text-background" : ""
              }`}
            >
              {d === 1 ? "Today" : `${d}d`}
            </Link>
          ))}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/orders?status=${f.value}&days=${daysNum}`}
            className={`px-3 py-1 rounded-full text-xs border ${
              status === f.value
                ? "bg-foreground text-background border-foreground"
                : "hover:border-foreground/40"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {(!orders || orders.length === 0) ? (
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" />}
          title="No orders yet"
          description="When customers place orders via QR code, they'll appear here. Share your menu link or print QR codes to get started."
          action={{ label: "Go to Tables & QR", href: "/tables" }}
        />
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <OrdersList orders={orders as any} />
      )}
    </div>
  );
}
