-- Fix: Replace race-prone COUNT-based order number with atomic counter.
-- Two concurrent orders will never get the same number.

CREATE TABLE order_counters (
  restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  last_number INT DEFAULT 0 NOT NULL
);

-- Replace the trigger function with an atomic version
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INT;
BEGIN
  -- Upsert the counter and atomically increment in one statement.
  -- The FOR UPDATE implicit in INSERT...ON CONFLICT prevents races.
  INSERT INTO order_counters (restaurant_id, last_number)
  VALUES (NEW.restaurant_id, 1)
  ON CONFLICT (restaurant_id)
  DO UPDATE SET last_number = order_counters.last_number + 1
  RETURNING last_number INTO next_num;

  NEW.order_number = 'ORD-' || LPAD(next_num::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on order_counters (internal table, no direct access needed)
ALTER TABLE order_counters ENABLE ROW LEVEL SECURITY;
