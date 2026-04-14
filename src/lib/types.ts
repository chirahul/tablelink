// ============================================================
// Database types matching Supabase schema
// ============================================================

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  upi_id: string | null;
  upi_qr_image_url: string | null;
  is_active: boolean;
  opening_hours: Record<string, { open: string; close: string }>;
  settings: RestaurantSettings;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type RestaurantSettings = {
  currency: string;
  tax_rate: number;
  accept_online_payment: boolean;
};

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  sort_order: number;
  tags: string[];
  variants: MenuVariant[] | null;
  addons: MenuAddon[] | null;
  created_at: string;
  updated_at: string;
};

export type MenuVariant = {
  name: string;
  price: number;
};

export type MenuAddon = {
  name: string;
  price: number;
};

export type Table = {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code_url: string | null;
  is_active: boolean;
  capacity: number | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type PaymentMethod = "upi" | "counter" | "unpaid";

export type PaymentStatus = "pending" | "paid";

export type Order = {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  variant: string | null;
  addons: MenuAddon[] | null;
  notes: string | null;
  created_at: string;
};

// ============================================================
// Joined / enriched types for UI
// ============================================================

export type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  table: Table;
};

export type MenuWithCategories = Category & {
  menu_items: MenuItem[];
};

// ============================================================
// Cart types (client-side only)
// ============================================================

export type CartItem = {
  id: string; // unique cart item ID (generated client-side)
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  variant: MenuVariant | null;
  addons: MenuAddon[];
  notes: string;
  is_veg: boolean;
  image_url: string | null;
};
