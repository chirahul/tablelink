-- 015_soft_delete.sql
-- Soft delete for menu items & categories so deleting a dish that's been
-- ordered preserves order history (the row stays; queries just filter it out).

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial indexes keep the common "live rows" lookups fast.
CREATE INDEX IF NOT EXISTS idx_menu_items_live
  ON menu_items(restaurant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_live
  ON categories(restaurant_id) WHERE deleted_at IS NULL;
