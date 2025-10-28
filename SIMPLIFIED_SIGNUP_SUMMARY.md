# Simplified Signup Flow - Summary

## What Changed

Simplified the signup process to a clean 2-step flow:
1. **`/auth`** - User registers with email/password only
2. **`/company-setup`** - User fills out company details after login

## Changes Made

### 1. **Auth.tsx** - Simplified Signup Form
- ❌ Removed multi-step signup (Step 1 & Step 2)
- ❌ Removed company data collection (name, website, description, size, industry, address, phone)
- ✅ Simple form with just: Email, Password, Confirm Password
- ✅ Added message: "After registration, you'll be able to set up your company profile"

### 2. **AuthContext.tsx** - Simplified signUp Function
- ❌ Removed `companyData` parameter
- ❌ Removed user metadata for company fields
- ✅ Only stores `user_type: 'company'` in metadata
- ✅ Cleaner function signature: `signUp(email, password)`

### 3. **Database Trigger** - Simple Profile Creation
- ❌ No longer reads company data from user metadata
- ✅ Creates empty company profile with just:
  - `user_id`
  - `role` (defaults to 'owner')
  - `email`
  - `created_at` / `updated_at`

## Apply the Changes

### Run this SQL in Supabase:

```sql
-- File: SIMPLE_SIGNUP_TRIGGER.sql
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.company_profiles (
    user_id,
    role,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'owner',
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();
```

## User Flow

### Before (Complex):
1. User goes to `/auth`
2. Enters email, password, confirm password, **company name** → Click "Continue"
3. Enters website, description, size, industry, address, phone → Click "Create Account"
4. Confirms email
5. Logs in
6. Redirected to platform

### After (Simple):
1. User goes to `/auth`
2. Enters email, password, confirm password → Click "Create Account"
3. Confirms email
4. Logs in
5. **Redirected to `/company-setup`** to fill out company details
6. After setup, can access platform

## Benefits

✅ **Faster Registration** - Users can sign up in seconds
✅ **Better UX** - Less overwhelming, one step at a time
✅ **Cleaner Code** - Removed complex multi-step form logic
✅ **Flexible** - Users can skip company setup and fill it later
✅ **Standard Flow** - Matches common auth patterns (email/password first, profile later)

## Testing

1. **Register a new user**:
   - Go to `/auth`
   - Click "Sign Up" tab
   - Enter email and password
   - Click "Create Account"
   - Should see success message

2. **Check database**:
   - User should be in `auth.users`
   - Empty company profile should be in `company_profiles` with `role='owner'` and `email` set

3. **Login and setup**:
   - Confirm email (check inbox)
   - Login
   - Should be redirected to `/company-setup`
   - Fill out company details
   - Save and access platform

## Files Modified

- ✅ `src/pages/Auth.tsx` - Removed multi-step form
- ✅ `src/contexts/AuthContext.tsx` - Simplified signUp function
- ✅ `SIMPLE_SIGNUP_TRIGGER.sql` - New trigger function (apply this!)

## Next Steps

After applying the SQL trigger, test the complete flow:
1. Register new user
2. Confirm email
3. Login
4. Fill out company setup
5. Start using the platform

Everything should work smoothly! 🎉
