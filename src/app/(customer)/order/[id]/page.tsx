import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderTracker } from "@/components/customer/order-tracker";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderTrackingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `*, order_items(*, menu_item:menu_items(id, name, is_veg, image_url)), table:tables(id, table_number), restaurant:restaurants(id, name, slug)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <OrderTracker initialOrder={order as any} />;
}
