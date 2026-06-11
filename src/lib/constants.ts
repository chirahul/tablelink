export const APP_NAME = "TheTableLynk";
export const APP_TAGLINE = "Tap Into Better Dining.";
export const APP_DESCRIPTION =
  "QR code-based table ordering for restaurants. No app download needed.";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  served: "Served",
  cancelled: "Cancelled",
};

// Status pill colors — aligned to the TheTableLynk design system:
// New/incoming = primary orange, Preparing = amber, Ready = green,
// Served/Paid = neutral grey, Cancelled = error red.
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  confirmed: "bg-amber-100 text-amber-900",
  preparing: "bg-orange-100 text-orange-900",
  ready: "bg-green-100 text-green-900",
  served: "bg-muted text-muted-foreground",
  cancelled: "bg-red-100 text-red-900",
};

export const DEFAULT_CURRENCY = "INR";
export const CURRENCY_SYMBOL = "\u20B9"; // ₹
