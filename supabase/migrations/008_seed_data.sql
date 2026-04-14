-- Seed data for demo restaurant
-- NOTE: This requires a user to exist in auth.users first.
-- Run this after creating your first admin user via the app or Supabase dashboard.
-- Replace 'YOUR_USER_ID' with the actual user UUID.

-- Example seed (uncomment and replace YOUR_USER_ID after creating a user):

/*
INSERT INTO restaurants (id, name, slug, description, phone, email, address, upi_id, owner_id, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Restaurant',
  'demo-restaurant',
  'A demo restaurant to showcase TableLink. Try scanning a QR code to place an order!',
  '+91 98765 43210',
  'demo@tablelink.app',
  '123 Food Street, Mumbai, Maharashtra',
  'demo@upi',
  'YOUR_USER_ID',
  '{"currency": "INR", "tax_rate": 5, "accept_online_payment": true}'
);

INSERT INTO categories (id, restaurant_id, name, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Starters', 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Main Course', 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Beverages', 3),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Desserts', 4);

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_veg, tags, variants, addons) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Paneer Tikka', 'Marinated cottage cheese grilled to perfection', 249.00, true, '{"bestseller", "spicy"}', '[{"name": "Half", "price": 149}, {"name": "Full", "price": 249}]', '[{"name": "Extra Mint Chutney", "price": 20}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Chicken Wings', 'Crispy fried chicken wings with hot sauce', 299.00, false, '{"spicy"}', NULL, '[{"name": "Extra Sauce", "price": 30}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Veg Spring Rolls', 'Crispy rolls stuffed with mixed vegetables', 179.00, true, '{"new"}', NULL, NULL),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Butter Chicken', 'Creamy tomato-based chicken curry', 349.00, false, '{"bestseller"}', '[{"name": "Half", "price": 199}, {"name": "Full", "price": 349}]', '[{"name": "Extra Butter Naan", "price": 40}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Dal Makhani', 'Slow-cooked black lentils in a rich creamy gravy', 249.00, true, '{"bestseller"}', NULL, '[{"name": "Extra Rice", "price": 60}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Veg Biryani', 'Fragrant basmati rice with mixed vegetables and spices', 229.00, true, '{}', '[{"name": "Half", "price": 139}, {"name": "Full", "price": 229}]', '[{"name": "Extra Raita", "price": 30}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Masala Chai', 'Traditional Indian spiced tea', 49.00, true, '{}', NULL, NULL),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Cold Coffee', 'Chilled coffee blended with ice cream', 129.00, true, '{"bestseller"}', NULL, '[{"name": "Extra Shot", "price": 30}]'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Fresh Lime Soda', 'Refreshing lime with soda water', 79.00, true, '{}', '[{"name": "Sweet", "price": 79}, {"name": "Salt", "price": 79}]', NULL),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Gulab Jamun', 'Soft milk-solid dumplings soaked in sugar syrup', 99.00, true, '{}', NULL, NULL),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Brownie with Ice Cream', 'Warm chocolate brownie topped with vanilla ice cream', 199.00, true, '{"bestseller"}', NULL, '[{"name": "Extra Scoop", "price": 50}]');

INSERT INTO tables (restaurant_id, table_number, capacity) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'T1', 2),
  ('a0000000-0000-0000-0000-000000000001', 'T2', 2),
  ('a0000000-0000-0000-0000-000000000001', 'T3', 4),
  ('a0000000-0000-0000-0000-000000000001', 'T4', 4),
  ('a0000000-0000-0000-0000-000000000001', 'T5', 6),
  ('a0000000-0000-0000-0000-000000000001', 'T6', 6),
  ('a0000000-0000-0000-0000-000000000001', 'T7', 8),
  ('a0000000-0000-0000-0000-000000000001', 'T8', 8);
*/
