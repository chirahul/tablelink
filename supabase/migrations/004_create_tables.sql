-- Create tables table (restaurant tables/seats)
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  capacity INT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(restaurant_id, table_number)
);

CREATE INDEX idx_tables_restaurant_id ON tables(restaurant_id);

CREATE TRIGGER tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
