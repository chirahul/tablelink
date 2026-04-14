-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RESTAURANTS
-- ============================================================

-- Public: anyone can read active restaurants (for menu pages)
CREATE POLICY "Public can view active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

-- Owner: full access to their own restaurant
CREATE POLICY "Owners can manage their restaurant"
  ON restaurants FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Public: read active categories for active restaurants
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Owner: manage categories for their restaurant
CREATE POLICY "Owners can manage their categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- ============================================================
-- MENU ITEMS
-- ============================================================

-- Public: read available menu items for active restaurants
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Owner: manage menu items for their restaurant
CREATE POLICY "Owners can manage their menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- ============================================================
-- TABLES
-- ============================================================

-- Public: read active tables (needed for QR code validation)
CREATE POLICY "Public can view active tables"
  ON tables FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Owner: manage tables for their restaurant
CREATE POLICY "Owners can manage their tables"
  ON tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- ============================================================
-- ORDERS
-- ============================================================

-- Public: anyone can create an order (guest ordering)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Public: customers can view their own order by ID (for tracking)
CREATE POLICY "Anyone can view orders by ID"
  ON orders FOR SELECT
  USING (true);

-- Owner: restaurant owners can view and update their orders
CREATE POLICY "Owners can manage their orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- ============================================================
-- ORDER ITEMS
-- ============================================================

-- Public: anyone can insert order items (part of order creation)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Public: anyone can view order items (for order tracking)
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);
