# Signup RLS Fix - Summary

## Problem
Users get "Database error saving new user" when trying to sign up. This is caused by RLS (Row Level Security) policies blocking the database trigger from creating a `company_profiles` record during signup.

## Root Cause
When a new user signs up:
1. User is created in `auth.users`
2. Database trigger `on_auth_user_created` fires
3. Trigger function `create_company_profile_for_user()` tries to INSERT into `company_profiles`
4. **RLS policy blocks the insert** because:
   - The existing policy requires `auth.uid() = user_id AND role = 'owner'`
   - During signup, `auth.uid()` might not be properly set in the trigger context
   - Even though the function is `SECURITY DEFINER`, RLS can still apply in some edge cases

## Solution
The fix (`FIX_SIGNUP_RLS.sql`) does the following:

### 1. Add RLS Policy for Service Role
- Creates a policy that allows `service_role` to insert into `company_profiles`
- This ensures the trigger function can insert even if other policies fail
- `service_role` is the role used by SECURITY DEFINER functions in Supabase

### 2. Ensure Trigger Function is Correct
- Updates the trigger function with proper error handling
- Handles team invitations (skips profile creation if user has pending invitation)
- Uses `SECURITY DEFINER` to run with elevated privileges
- Ensures function is owned by `postgres` (which bypasses RLS)

### 3. Verify Trigger Exists
- Ensures the trigger `on_auth_user_created` exists and is properly configured
- Grants proper execute permissions to `anon`, `authenticated`, and `service_role`

### 4. Verify Existing Policies
- Ensures the policy "Users can insert their own profile" exists for regular users

## How to Apply

Run the SQL file `FIX_SIGNUP_RLS.sql` in Supabase SQL Editor.

The file includes verification queries at the end that will show:
- Count of INSERT policies on `company_profiles`
- Whether the trigger function exists
- Whether the trigger exists

## Testing

After applying the fix:
1. Try signing up with a new email address
2. The signup should succeed
3. A `company_profiles` record should be created automatically
4. User should be able to log in

## Technical Details

### Why SECURITY DEFINER might not bypass RLS
- In Supabase/PostgreSQL, SECURITY DEFINER functions run with the privileges of the function owner
- Normally, functions owned by `postgres` should bypass RLS
- However, in some edge cases (especially during auth operations), RLS might still be checked
- Adding the `service_role` policy ensures the insert succeeds regardless

### Why we need the service_role policy
- The trigger function runs in the context of the auth system
- Even with SECURITY DEFINER, RLS policies can block inserts if they don't match
- The `service_role` policy allows inserts from database triggers/system operations
- This doesn't compromise security because:
  - Only the trigger function (which is SECURITY DEFINER) can use this
  - Regular users still need to match the "Users can insert their own profile" policy
  - The trigger only inserts with `role = 'owner'` for the newly created user


