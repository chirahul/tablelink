-- 016_platform_settings.sql
-- Singleton table for platform-level billing details (payment QR + contact)
-- shown to restaurant owners on the billing page / paywall.

CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  billing_qr_url TEXT,
  billing_upi TEXT,
  billing_phone TEXT,
  billing_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT platform_settings_singleton CHECK (id = 1)
);

INSERT INTO platform_settings (id, billing_upi, billing_phone, billing_email)
VALUES (1, '78795 99093', '78795 99093', 'hello@thetablelynk.com')
ON CONFLICT (id) DO NOTHING;

-- Read/written only via the service-role (admin) client.
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
