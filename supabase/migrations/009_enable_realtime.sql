-- Enable Supabase Realtime for live kitchen dashboard and order tracking
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
