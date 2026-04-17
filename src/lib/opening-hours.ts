type HoursMap = Record<string, { open: string; close: string }>;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * Returns whether the restaurant is currently open based on its
 * opening_hours setting. If no hours are configured, we assume open.
 */
export function isRestaurantOpen(openingHours: HoursMap | null | undefined): {
  isOpen: boolean;
  todayHours: { open: string; close: string } | null;
} {
  if (!openingHours || Object.keys(openingHours).length === 0) {
    return { isOpen: true, todayHours: null };
  }

  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const today = openingHours[dayKey];

  if (!today || !today.open || !today.close) {
    // No hours configured for today — assume closed
    return { isOpen: false, todayHours: null };
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // Handle overnight hours (e.g., 18:00 - 02:00)
  let isOpen: boolean;
  if (closeMinutes > openMinutes) {
    isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  } else {
    isOpen = nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }

  return { isOpen, todayHours: today };
}
