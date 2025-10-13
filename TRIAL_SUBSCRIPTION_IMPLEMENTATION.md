# Trial & Subscription System Implementation

## Overview
This document describes the implementation of the trial and subscription system for Hirios, which provides new users with a 7-day free trial and supports yearly paid subscriptions.

## Features Implemented

### 1. Database Schema Changes
**Migration File**: `supabase/migrations/20251012000000_add_trial_subscription_tracking.sql`

**New Fields Added to `company_profiles`**:
- `trial_started_at`: Timestamp when user first logged in
- `trial_expires_at`: Timestamp when trial expires (trial_started_at + 7 days)
- `subscription_expires_at`: Timestamp when paid subscription expires (for yearly subscriptions)

**Subscription Plans**:
- `trial`: 7-day free trial (default for new registrations)
- `paid`: Yearly paid subscription

**Database Functions**:
- `start_trial_if_needed(p_user_id)`: Automatically starts 7-day trial on first login
- `is_subscription_active(p_user_id)`: Checks if user's subscription is currently active

### 2. Authentication Flow Updates
**File**: `src/contexts/AuthContext.tsx`

**Changes**:
- Added `subscriptionActive` and `subscriptionError` to auth context
- On each login/session check:
  1. Calls `start_trial_if_needed()` to initialize trial if user hasn't logged in before
  2. Calls `is_subscription_active()` to check subscription status
  3. Sets subscription error if expired

### 3. Subscription Status Hook
**File**: `src/hooks/useSubscriptionStatus.ts`

**Features**:
- Fetches subscription details from `company_profiles`
- Calculates days remaining for both trial and paid subscriptions
- Auto-refreshes every minute to keep countdown accurate
- Returns:
  - `plan`: 'trial' or 'paid'
  - `isActive`: Whether subscription is currently active
  - `daysRemaining`: Number of days until expiration
  - `expiresAt`: Exact expiration date
  - `loading`: Loading state

### 4. Navbar Badge
**File**: `src/components/ui/navbar-1.tsx`

**Features**:
- Displays days remaining for trial and paid users
- Color-coded badges:
  - Trial: Yellow (warning) or Red (≤7 days)
  - Paid: Green or Orange (≤7 days)
- Tooltip on hover: Shows expiration message and support contact
- Visible on desktop, tablet, and mobile views

### 5. Subscription Guard
**File**: `src/components/SubscriptionGuard.tsx`

**Features**:
- Wraps protected routes in the application
- Blocks access when subscription is expired
- Shows professional blocking screen with:
  - Clear expiration message
  - Support email (support@hirios.com)
  - "Email Support" button (opens mailto link)
  - "Sign Out" button
  - Reassurance that data is safe

**File**: `src/App.tsx`
- All protected routes wrapped with `SubscriptionGuard`
- Auth pages remain accessible even when subscription expired

### 6. TypeScript Types
**File**: `src/integrations/supabase/types.ts`

**Updates**:
- Added new fields to `company_profiles` type definition
- Added RPC function type definitions for `start_trial_if_needed` and `is_subscription_active`

## User Flow

### New User Registration
1. User registers → `subscription_plan` set to `'trial'`
2. User confirms email
3. **First login** → `start_trial_if_needed()` is called:
   - Sets `trial_started_at` to NOW()
   - Sets `trial_expires_at` to NOW() + 7 days
4. User sees badge showing "7 days left"
5. User has full access to all features

### During Trial
1. Navbar badge shows remaining days
2. Hover shows: "Trial expires in X days. Contact support@hirios.com to upgrade."
3. Full functionality available
4. Badge color changes to red when ≤7 days remaining

### Trial Expires
1. User tries to login
2. Auth system detects expired trial
3. User sees blocking screen:
   - "Subscription Expired" message
   - support@hirios.com contact info
   - Email support button
   - Sign out button
4. User cannot access any protected routes
5. Data remains in database

### Manual Upgrade (Admin Action)
From Supabase dashboard or SQL client:

```sql
-- Upgrade user from trial to paid (1 year)
UPDATE company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'USER_UUID_HERE';
```

### Paid Subscription
1. Admin updates user's subscription_plan to 'paid'
2. Sets `subscription_expires_at` to 1 year from now
3. User has full access
4. Badge shows days remaining until renewal
5. Same expiration flow when subscription ends

## Important Notes

**NO FREE PLAN**: This system has only two subscription states:
- **Trial**: 7-day free trial for new users
- **Paid**: Yearly subscription after trial ends

All users must either be on trial or paid subscription. There is no unlimited free plan.

## Testing the Implementation

### Prerequisites
1. Apply the migration:
```bash
cd supabase
supabase db push
# or
supabase migration up
```

2. Verify functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('start_trial_if_needed', 'is_subscription_active');
```

### Test Scenarios

#### 1. New User Trial Flow
1. Register a new user
2. Confirm email
3. Login for the first time
4. Check database:
```sql
SELECT subscription_plan, trial_started_at, trial_expires_at 
FROM company_profiles 
WHERE user_id = 'YOUR_USER_ID';
```
5. Verify badge shows "7 days left"

#### 2. Expired Trial
1. Manually expire a trial user:
```sql
UPDATE company_profiles
SET trial_expires_at = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR_USER_ID';
```
2. Logout and login again
3. Should see blocking screen
4. Cannot access protected routes

#### 3. Upgrade to Paid
1. While expired/during trial:
```sql
UPDATE company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'YOUR_USER_ID';
```
2. Logout and login
3. Should have full access
4. Badge shows "365 days left"

## Admin Operations

### View All Trial Users
```sql
SELECT 
  user_id,
  trial_started_at,
  trial_expires_at,
  EXTRACT(DAY FROM trial_expires_at - NOW()) as days_remaining
FROM company_profiles
WHERE subscription_plan = 'trial'
ORDER BY trial_expires_at;
```

### View Expired Trials
```sql
SELECT user_id, trial_expires_at
FROM company_profiles
WHERE subscription_plan = 'trial' 
AND trial_expires_at < NOW();
```

### Upgrade User to Paid
```sql
UPDATE company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'USER_UUID';
```

### Extend Trial (Special Cases)
```sql
UPDATE company_profiles
SET trial_expires_at = trial_expires_at + INTERVAL '7 days'
WHERE user_id = 'USER_UUID';
```

### Check Subscription Status
```sql
SELECT is_subscription_active('USER_UUID');
```

## Configuration

### Trial Duration
To change trial duration, modify the migration:
```sql
trial_expires_at = NOW() + INTERVAL '7 days'  -- Change to desired duration
```

### Subscription Duration
Default is 1 year. Adjust when upgrading users:
```sql
subscription_expires_at = NOW() + INTERVAL '1 year'  -- Change as needed
```

### Support Email
Update in these files:
- `src/components/ui/navbar-1.tsx` (line ~105)
- `src/components/SubscriptionGuard.tsx` (line ~74)

## Important Notes

1. **Trial Starts on First Login**: Not on registration, so email confirmation time doesn't count against trial
2. **Data Retention**: All user data remains in database when subscription expires
3. **No Automatic Payments**: This is a manual upgrade system via support contact
4. **No Free Plan**: Only trial (7 days) or paid (yearly) - no unlimited free access
5. **Auth Pages Accessible**: Users can always access login/signup pages even when expired
6. **Real-time Updates**: Badge updates every minute to show accurate countdown

## Troubleshooting

### Badge Not Showing
- Check that user is logged in
- Verify `trial_started_at` is set in database
- Check browser console for errors

### Trial Not Starting
- Verify migration was applied successfully
- Check Supabase logs for function errors
- Ensure RLS policies allow function execution

### Blocking Screen Not Showing
- Check that `SubscriptionGuard` is wrapping routes in App.tsx
- Verify subscription check is running in AuthContext
- Check browser console for errors

## Future Enhancements

Potential additions:
1. Automated email notifications before expiry
2. In-app payment integration (Stripe)
3. Multiple subscription tiers
4. Usage analytics per subscription plan
5. Admin dashboard for subscription management
6. Automated subscription renewal
7. Proration for upgrades/downgrades

## Support

For issues or questions:
- Contact: support@hirios.com
- Check Supabase logs for errors
- Review browser console for client-side issues

