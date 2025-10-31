-- Update the trigger function to set 'trial' instead of 'free' for new users
CREATE OR REPLACE FUNCTION "public"."create_company_profile_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Create company profile for all new users (B2B platform)
  -- New users start with 'trial' plan (14 days free)
  INSERT INTO public.company_profiles (
    user_id, 
    company_name, 
    company_website,
    company_description,
    company_size,
    industry,
    address,
    phone,
    subscription_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    NEW.raw_user_meta_data ->> 'company_website',
    NEW.raw_user_meta_data ->> 'company_description',
    NEW.raw_user_meta_data ->> 'company_size',
    NEW.raw_user_meta_data ->> 'industry',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'phone',
    'trial'  -- Changed from 'free' to 'trial'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION "public"."create_company_profile_for_user"() IS 
  'Creates company profile with trial plan for new users on signup';

