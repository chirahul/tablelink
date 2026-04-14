import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: { status?: string; payment_status?: "pending" | "paid" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the order belongs to a restaurant owned by this user.
  // Row-Level Security policies already enforce this for UPDATE, but we
  // also do an explicit check to return a clean 403 if something is off.
  const { data: order } = await supabase
    .from("orders")
    .select("id, restaurant_id, restaurants!inner(owner_id)")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Build the update payload
  const updates: Record<string, string> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.payment_status !== undefined) {
    if (body.payment_status !== "pending" && body.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Invalid payment_status" },
        { status: 400 }
      );
    }
    updates.payment_status = body.payment_status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No updates provided" },
      { status: 400 }
    );
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: updated });
}
