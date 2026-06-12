-- 013_subscriptions.sql
-- 3-day free trial → paid yearly subscription (Starter / Growth / Enterprise).
-- Manual activation: owners pay via UPI, a super admin marks them active.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS plan TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 days'),
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Grandfather every existing restaurant with a complimentary active year, so
-- nobody is locked out the moment enforcement ships. New restaurants created
-- after this migration fall back to the 3-day trial defaults above.
UPDATE restaurants
SET subscription_status = 'active',
    plan = COALESCE(plan, 'growth'),
    subscription_started_at = COALESCE(subscription_started_at, now()),
    subscription_ends_at = COALESCE(subscription_ends_at, now() + interval '1 year');

ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_subscription_status_chk;
ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_subscription_status_chk
  CHECK (subscription_status IN ('trialing', 'active', 'expired', 'past_due'));

CREATE INDEX IF NOT EXISTS idx_restaurants_subscription ON restaurants(subscription_status);
