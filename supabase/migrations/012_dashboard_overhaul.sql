-- Dashboard overhaul: table ordering, extra restaurant settings, and
-- lightweight menu analytics (QR scans + menu views).

-- Tables: support drag-and-drop ordering
ALTER TABLE tables ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 NOT NULL;

-- Restaurants: additional settings fields
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Lightweight analytics: one row per customer menu load.
-- source = 'qr'  -> opened from a table QR (has table_id)
--          'link' -> opened from a shared menu link (no table)
--          'direct'
CREATE TABLE IF NOT EXISTS menu_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('qr', 'link', 'direct')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_events_restaurant_created
  ON menu_events (restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_menu_events_table ON menu_events (table_id);

ALTER TABLE menu_events ENABLE ROW LEVEL SECURITY;

-- Public: anyone can log a menu event (anonymous menu loads).
CREATE POLICY "Anyone can log menu events"
  ON menu_events FOR INSERT
  WITH CHECK (true);

-- Owner: restaurant owners can read their own events (dashboard/table stats).
CREATE POLICY "Owners can view their menu events"
  ON menu_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_events.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );
