# Apply Team Management Migrations

Run these SQL commands in your Supabase SQL Editor in this exact order:

## Step 1: Apply the main team support migration
```sql
-- Run the contents of: supabase/migrations/20250128000002_add_team_members_support.sql
-- This adds role column, team_invitations table, and RLS policies
```

## Step 2: Add email column and triggers
```sql
-- Run the contents of: supabase/migrations/20250128000003_add_email_to_company_profiles.sql
-- This adds email column and auto-population triggers
```

## Step 3: Update profile creation function
```sql
-- Run the contents of: supabase/migrations/20250128000004_update_profile_creation_with_email.sql
-- This updates the user registration trigger to include role and email
```

## Step 4: Populate existing emails
```sql
-- Run the contents of: supabase/migrations/20250128000005_populate_existing_emails.sql
-- This backfills emails for existing users
```

## Quick Fix for Current Error

If you're getting "Database error saving new user", run this immediately in Supabase SQL Editor:

```sql
-- Drop and recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email text;
BEGIN
  -- Get the user's email
  v_user_email := NEW.email;

  -- Create company profile with email and role
  INSERT INTO public.company_profiles (
    user_id,
    role,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'owner',
    v_user_email,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating company profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();
```

## Verify the Fix

After running the above, test by:
1. Try registering a new user
2. Check if the error is gone
3. Verify the user appears in `company_profiles` table with `role = 'owner'` and their email

## Common Issues

### Issue 1: Column doesn't exist
If you get "column 'role' does not exist", run migration 20250128000002 first.

### Issue 2: Column already exists
If you get "column already exists", that's fine - the migrations use `IF NOT EXISTS`.

### Issue 3: Trigger already exists
The migrations use `DROP TRIGGER IF EXISTS` so this shouldn't happen.
