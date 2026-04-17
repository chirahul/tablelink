-- Fix: Tighten order and order_items SELECT policies.
-- Previously: anyone could read any order (USING true).
-- Now: only the customer who placed it, the restaurant owner, or
-- unauthenticated users viewing by exact order ID (for guest tracking).

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view orders by ID" ON orders;
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;

-- Orders: restaurant owner can see all their restaurant's orders
CREATE POLICY "Owners can view their orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Orders: customers can see orders they placed (logged in)
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (
    customer_id IS NOT NULL
    AND customer_id = auth.uid()
  );

-- Orders: the order API uses the admin client (service role) for
-- guest order creation and tracking, bypassing RLS. This is safe
-- because the API validates access itself.

-- Order items: accessible if you can see the parent order
CREATE POLICY "Order items visible to order viewers"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        EXISTS (
          SELECT 1 FROM restaurants
          WHERE restaurants.id = orders.restaurant_id
          AND restaurants.owner_id = auth.uid()
        )
        OR (orders.customer_id IS NOT NULL AND orders.customer_id = auth.uid())
      )
    )
  );
