import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <p className="text-muted-foreground">
        Live orders will appear here in real-time.
      </p>
    </div>
  );
}
