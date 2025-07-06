
-- Create auth profiles table for basic user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('job_seeker', 'company')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  company_website TEXT,
  company_size TEXT,
  industry TEXT,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update jobs table to reference company profiles
ALTER TABLE public.jobs ADD COLUMN company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for company profiles
CREATE POLICY "Companies can view their own profile" 
  ON public.company_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can update their own profile" 
  ON public.company_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert their own profile" 
  ON public.company_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update jobs table RLS policies to only allow companies with active subscriptions
DROP POLICY IF EXISTS "Allow public insert access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public update access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public delete access to jobs" ON public.jobs;

CREATE POLICY "Companies with active subscriptions can insert jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid() 
      AND subscription_status = 'active'
      AND (subscription_end_date IS NULL OR subscription_end_date > now())
    )
  );

CREATE POLICY "Companies can update their own jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid() 
      AND id = jobs.company_profile_id
    )
  );

CREATE POLICY "Companies can delete their own jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid() 
      AND id = jobs.company_profile_id
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'job_seeker')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
