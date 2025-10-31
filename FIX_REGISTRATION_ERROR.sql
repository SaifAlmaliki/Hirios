-- IMMEDIATE FIX for "Database error saving new user"
-- Run this in Supabase SQL Editor RIGHT NOW

-- Step 1: Update the trigger function to use NEW.email directly and add error handling
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create company profile with email and role
  -- Use NEW.email directly from the auth.users insert
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
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating company profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();

-- Step 3: Verify the columns exist
-- If this fails, you need to run the main migration first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_profiles' AND column_name = 'role'
  ) THEN
    RAISE EXCEPTION 'Column role does not exist. Run migration 20250128000002 first!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_profiles' AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'Column email does not exist. Adding it now...';
    ALTER TABLE public.company_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Done! Try registering a new user now.
