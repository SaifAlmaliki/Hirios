-- Migration: Update create_company_profile_for_user to include email

CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email text;
BEGIN
  -- Get the user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Create company profile with email
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger should already exist, but recreate it to be safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_user();
