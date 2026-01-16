-- Migration: Update null merits and requests_remaining to 0
-- Date: 2026-01-11
-- Description: Update all users with null merits or requests_remaining to have 0 instead

-- Update null merits to 0
UPDATE users 
SET merits = 0 
WHERE merits IS NULL;

-- Update null requests_remaining to 0
UPDATE users 
SET requests_remaining = 0 
WHERE requests_remaining IS NULL;

-- Verify the updates
SELECT 
    COUNT(*) FILTER (WHERE merits = 0) as users_with_zero_merits,
    COUNT(*) FILTER (WHERE requests_remaining = 0) as users_with_zero_requests
FROM users;
