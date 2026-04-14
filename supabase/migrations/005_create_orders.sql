-- Create enum types for orders
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE payment_method AS ENUM ('upi', 'counter', 'unpaid');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id),
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_phone TEXT,
  order_number TEXT NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  payment_method payment_method DEFAULT 'unpaid' NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate human-readable order numbers per restaurant
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE restaurant_id = NEW.restaurant_id
    AND created_at::date = CURRENT_DATE;

  NEW.order_number = 'ORD-' || LPAD(today_count::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
