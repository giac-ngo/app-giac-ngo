# Database Migration: Update Null Merits and Requests

## Overview
This migration updates all users with `null` values in `merits` or `requests_remaining` fields to `0`.

## Why This Migration?
- **Problem**: Some existing users have `null` values for `merits` and `requests_remaining`
- **Impact**: Frontend displays "Unlimited" instead of showing the actual count (0)
- **Solution**: Update all `null` values to `0` in the database

## Files
- `001_update_null_merits.sql` - SQL migration script
- `runMigration.js` - Node.js script to execute the migration safely

## How to Run

### Option 1: Using Node.js Script (Recommended)
```bash
cd server/migrations
node runMigration.js
```

This script will:
1. Count users with null values
2. Update them to 0 within a transaction
3. Verify the changes
4. Rollback if anything fails

### Option 2: Manual SQL Execution
Connect to your PostgreSQL database and run:
```sql
-- Update null merits
UPDATE users SET merits = 0 WHERE merits IS NULL;

-- Update null requests_remaining
UPDATE users SET requests_remaining = 0 WHERE requests_remaining IS NULL;
```

## Verification
After running the migration, verify with:
```sql
SELECT 
    COUNT(*) FILTER (WHERE merits IS NULL) as null_merits,
    COUNT(*) FILTER (WHERE requests_remaining IS NULL) as null_requests,
    COUNT(*) FILTER (WHERE merits = 0) as zero_merits,
    COUNT(*) FILTER (WHERE requests_remaining = 0) as zero_requests
FROM users;
```

Expected result:
- `null_merits`: 0
- `null_requests`: 0
- `zero_merits`: (number of users with 0 merits)
- `zero_requests`: (number of users with 0 requests)

## Related Changes
This migration works together with:
1. **Frontend** (`ConversationSidebar.tsx`): Updated display logic to show 0 instead of "Unlimited" for null values
2. **Backend** (`authController.js`): New users are now created with `merits: 0` and `requestsRemaining: 0`

## Rollback
If you need to rollback (not recommended), you can set values back to null:
```sql
-- Only if you really need to rollback
UPDATE users SET merits = NULL WHERE merits = 0 AND created_at < '2026-01-11';
UPDATE users SET requests_remaining = NULL WHERE requests_remaining = 0 AND created_at < '2026-01-11';
```

## Notes
- The migration uses transactions for safety
- It will automatically rollback if any errors occur
- New users (created after this fix) will have `merits: 0` and `requestsRemaining: 0` by default
- Users with truly unlimited access should have negative values (e.g., `-1`) instead of `null`
