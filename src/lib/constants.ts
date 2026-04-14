export const APP_NAME = "TableLink";
export const APP_TAGLINE = "Scan. Order. Eat.";
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

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  served: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export const DEFAULT_CURRENCY = "INR";
export const CURRENCY_SYMBOL = "\u20B9"; // ₹
