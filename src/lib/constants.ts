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

// Status pill colors — semantic tokens, dark-mode aware (see globals.css).
// New/Confirmed = info, Preparing = warning, Ready = success,
// Served = neutral, Cancelled = destructive.
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-info-container text-info",
  confirmed: "bg-info-container text-info",
  preparing: "bg-warning-container text-warning",
  ready: "bg-success-container text-success",
  served: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive-container text-destructive",
};

export const DEFAULT_CURRENCY = "INR";
export const CURRENCY_SYMBOL = "\u20B9"; // ₹
