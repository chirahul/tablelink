-- 014_existing_to_trial.sql
-- Policy: existing restaurants get a fresh 3-day trial (not the complimentary
-- year from migration 013), so they convert to paid quickly. The platform
-- owner's own restaurant stays active so the founder is never locked out.

UPDATE restaurants
SET subscription_status = 'trialing',
    plan = NULL,
    trial_ends_at = now() + interval '3 days',
    subscription_started_at = NULL,
    subscription_ends_at = NULL
WHERE owner_id <> '751e3d45-d4eb-4bff-a8c6-661a93899333';
