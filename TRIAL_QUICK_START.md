# Trial Subscription System - Quick Start Guide

## Step 1: Apply the Migration

### Option A: Using Supabase CLI (Recommended)
```bash
cd supabase
npx supabase db push
```

### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251012000000_add_trial_subscription_tracking.sql`
4. Paste and run the SQL

### Option C: Using Local Development
```bash
npx supabase migration up
```

## Step 2: Verify Migration Success

Run this SQL query in Supabase SQL Editor:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_profiles' 
AND column_name IN ('trial_started_at', 'trial_expires_at', 'subscription_expires_at');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('start_trial_if_needed', 'is_subscription_active');
```

Expected output:
- 3 columns found (trial_started_at, trial_expires_at, subscription_expires_at)
- 2 functions found (start_trial_if_needed, is_subscription_active)

## Step 3: Convert Existing 'Free' Users to Trial

```sql
-- Convert all existing 'free' users to trial
-- (The migration will do this automatically, but you can run it manually if needed)
UPDATE company_profiles
SET subscription_plan = 'trial'
WHERE subscription_plan = 'free' OR subscription_plan IS NULL;
```

**Important**: There is NO free plan in this system - only trial (7 days) or paid (yearly).

## Step 4: Test the System

### Test 1: Register New User
1. Register a new user account
2. Confirm email
3. Login for the first time
4. **Expected Result**: 
   - User logs in successfully
   - Badge shows "7 days left" in navbar
   - Full access to all features

### Test 2: Check Database
```sql
-- Replace with your test user's ID
SELECT 
  user_id,
  subscription_plan,
  trial_started_at,
  trial_expires_at,
  EXTRACT(DAY FROM trial_expires_at - NOW()) as days_remaining
FROM company_profiles
WHERE user_id = 'YOUR_USER_ID';
```

**Expected Result**:
- `subscription_plan`: 'trial'
- `trial_started_at`: Current timestamp
- `trial_expires_at`: Current timestamp + 7 days
- `days_remaining`: ~7

### Test 3: Test Expired Trial
1. Manually expire a test user:
```sql
UPDATE company_profiles
SET trial_expires_at = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR_TEST_USER_ID';
```

2. Logout and login as that user
3. **Expected Result**: 
   - User sees blocking screen
   - Message: "Your trial/subscription has expired"
   - Support email shown: support@hirios.com
   - Cannot access protected routes

### Test 4: Upgrade to Paid
1. While logged in as expired user (or any trial user):
```sql
UPDATE company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'YOUR_TEST_USER_ID';
```

2. Logout and login
3. **Expected Result**:
   - User has full access
   - Badge shows "365 days left"
   - No blocking screen

## Step 5: Run the Application

```bash
npm run dev
# or
npm start
```

Visit http://localhost:5173 (or your configured port)

## Common Admin Tasks

### View All Trial Users
```sql
SELECT 
  u.email,
  cp.subscription_plan,
  cp.trial_started_at,
  cp.trial_expires_at,
  EXTRACT(DAY FROM cp.trial_expires_at - NOW()) as days_remaining
FROM company_profiles cp
JOIN auth.users u ON u.id = cp.user_id
WHERE cp.subscription_plan = 'trial'
ORDER BY cp.trial_expires_at;
```

### Find Expired Trials
```sql
SELECT 
  u.email,
  cp.trial_expires_at
FROM company_profiles cp
JOIN auth.users u ON u.id = cp.user_id
WHERE cp.subscription_plan = 'trial' 
AND cp.trial_expires_at < NOW();
```

### Upgrade User to Paid (Manual)
```sql
-- Replace with actual user email
UPDATE company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Extend Trial (Special Cases)
```sql
-- Add 7 more days to a user's trial
UPDATE company_profiles
SET trial_expires_at = trial_expires_at + INTERVAL '7 days'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

## Troubleshooting

### Issue: Badge Not Showing
**Solution**: 
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Verify user is logged in

### Issue: Trial Not Starting on First Login
**Solution**:
1. Check if migration was applied:
```sql
SELECT * FROM public.start_trial_if_needed('USER_UUID');
```
2. Check Supabase logs for function errors
3. Verify RLS policies allow function execution

### Issue: "Function does not exist" Error
**Solution**: Migration wasn't applied properly. Re-run the migration SQL manually in Supabase dashboard.

### Issue: Blocking Screen Not Showing for Expired User
**Solution**:
1. Check subscription status:
```sql
SELECT public.is_subscription_active('USER_UUID');
```
2. If returns `true` but should be `false`, check database values:
```sql
SELECT subscription_plan, trial_expires_at, subscription_expires_at
FROM company_profiles
WHERE user_id = 'USER_UUID';
```
3. Clear browser local storage and login again

## Feature Behavior Summary

### New User Journey
1. **Registration** → Plan set to 'trial', no expiry yet
2. **First Login** → Trial starts, expires_at set to +7 days
3. **Days 1-7** → Full access, badge shows countdown
4. **Day 8+** → Access blocked, must contact support
5. **After Upgrade** → Full access restored

### Paid User Journey
1. **Manual Upgrade** → Admin sets plan to 'paid' + expires_at
2. **Access** → Full access for 1 year
3. **Badge** → Shows days remaining
4. **After Expiry** → Access blocked, must renew

## Next Steps

1. ✅ Apply migration
2. ✅ Test with new user registration
3. ✅ Test expired trial flow
4. ✅ Test paid upgrade
5. 📧 Set up email notifications (optional - future)
6. 💳 Integrate payment system (optional - future)
7. 📊 Monitor trial conversions

## Support

For technical issues or upgrade requests:
- Email: support@hirios.com
- Check: `TRIAL_SUBSCRIPTION_IMPLEMENTATION.md` for detailed documentation

