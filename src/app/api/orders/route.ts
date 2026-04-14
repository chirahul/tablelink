import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MenuAddon } from "@/lib/types";

type IncomingOrderItem = {
  menu_item_id: string;
  quantity: number;
  variant: string | null;
  addons: MenuAddon[];
  notes: string | null;
};

type IncomingOrder = {
  restaurant_id: string;
  table_id: string;
  customer_id?: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  payment_method: "counter" | "upi";
  items: IncomingOrderItem[];
};

export async function POST(request: Request) {
  let body: IncomingOrder;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic validation
  if (!body.restaurant_id || !body.table_id) {
    return NextResponse.json(
      { error: "Missing restaurant or table ID" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify restaurant exists and is active
  const { data: restaurant, error: rErr } = await admin
    .from("restaurants")
    .select("id, settings, is_active")
    .eq("id", body.restaurant_id)
    .maybeSingle();

  if (rErr || !restaurant || !restaurant.is_active) {
    return NextResponse.json(
      { error: "Restaurant not available" },
      { status: 404 }
    );
  }

  // Verify table belongs to this restaurant
  const { data: table } = await admin
    .from("tables")
    .select("id")
    .eq("id", body.table_id)
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!table) {
    return NextResponse.json(
      { error: "Invalid table" },
      { status: 400 }
    );
  }

  // Fetch real menu item prices (trust server, not client)
  const menuItemIds = [...new Set(body.items.map((i) => i.menu_item_id))];
  const { data: menuItems, error: mErr } = await admin
    .from("menu_items")
    .select("id, name, price, variants, is_available, restaurant_id")
    .in("id", menuItemIds);

  if (mErr || !menuItems) {
    return NextResponse.json(
      { error: "Failed to validate menu items" },
      { status: 500 }
    );
  }

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  // Calculate totals server-side
  let subtotal = 0;
  const orderItemInserts: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    variant: string | null;
    addons: MenuAddon[] | null;
    notes: string | null;
  }[] = [];

  for (const item of body.items) {
    const menuItem = menuMap.get(item.menu_item_id);
    if (!menuItem) {
      return NextResponse.json(
        { error: `Menu item ${item.menu_item_id} not found` },
        { status: 400 }
      );
    }
    if (menuItem.restaurant_id !== restaurant.id) {
      return NextResponse.json(
        { error: "Item does not belong to this restaurant" },
        { status: 400 }
      );
    }
    if (!menuItem.is_available) {
      return NextResponse.json(
        { error: `${menuItem.name} is not available` },
        { status: 400 }
      );
    }
    if (item.quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    // Resolve variant price
    let unitPrice = Number(menuItem.price);
    if (item.variant && menuItem.variants) {
      const variants = menuItem.variants as Array<{ name: string; price: number }>;
      const found = variants.find((v) => v.name === item.variant);
      if (found) unitPrice = Number(found.price);
    }

    const addonTotal = (item.addons ?? []).reduce(
      (sum, a) => sum + Number(a.price),
      0
    );
    const lineTotal = (unitPrice + addonTotal) * item.quantity;
    subtotal += lineTotal;

    orderItemInserts.push({
      menu_item_id: menuItem.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      variant: item.variant,
      addons: item.addons && item.addons.length > 0 ? item.addons : null,
      notes: item.notes,
    });
  }

  const settings = (restaurant.settings ?? {}) as { tax_rate?: number };
  const taxRate = Number(settings.tax_rate ?? 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Create the order
  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      restaurant_id: restaurant.id,
      table_id: table.id,
      customer_id: body.customer_id ?? null,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      status: "pending",
      payment_method: body.payment_method,
      payment_status: "pending",
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      notes: body.notes,
    })
    .select()
    .single();

  if (oErr || !order) {
    return NextResponse.json(
      { error: oErr?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  // Insert order items
  const itemsWithOrderId = orderItemInserts.map((i) => ({
    ...i,
    order_id: order.id,
  }));

  const { error: iErr } = await admin.from("order_items").insert(itemsWithOrderId);

  if (iErr) {
    // Rollback the order
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: `Failed to save order items: ${iErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ order });
}
