-- ==============================================
-- COMPLETE DATABASE RECREATION SCRIPT FOR HIRIOS
-- ==============================================
-- This script recreates ALL tables, features, and functionality
-- Run this in your Supabase SQL Editor to restore everything

-- ==============================================
-- 1. CORE TABLES
-- ==============================================

-- Company Profiles Table (with all fields from migrations)
CREATE TABLE IF NOT EXISTS public.company_profiles (
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
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium')),
  subscription_end_date TIMESTAMPTZ,
  jobs_posted_this_month INTEGER NOT NULL DEFAULT 0,
  last_job_count_reset TIMESTAMPTZ DEFAULT now(),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  employment_type TEXT NOT NULL DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level TEXT NOT NULL DEFAULT 'mid-level' CHECK (experience_level IN ('entry-level', 'mid-level', 'senior-level', 'executive')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications Table (with company upload fields)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  resume_url TEXT,
  resume_text TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  -- Company upload fields
  upload_source TEXT DEFAULT 'job_seeker' CHECK (upload_source IN ('job_seeker', 'company_upload')),
  uploaded_by_company BOOLEAN DEFAULT FALSE,
  uploaded_by_user_id UUID REFERENCES auth.users(id),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  original_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Screening Results Table (with all features)
CREATE TABLE IF NOT EXISTS public.screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  -- Basic candidate info
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  home_address TEXT,
  -- Resume info
  resume_url TEXT,
  resume_text TEXT,
  -- AI screening results
  screening_score INTEGER,
  screening_notes TEXT,
  screening_summary TEXT,
  -- Voice interview features
  voice_screening_requested BOOLEAN DEFAULT false,
  voice_screening_completed BOOLEAN DEFAULT false,
  voice_screening_notes TEXT,
  interview_summary TEXT,
  interview_completed_at TIMESTAMPTZ,
  -- Management features
  is_favorite BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================
-- 2. POINTS SYSTEM TABLES
-- ==============================================

-- User Points Table (with correct field names from points system)
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Point Transactions Table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'screening', 'voice_interview', 'bonus', 'refund')),
  points INTEGER NOT NULL, -- Positive for additions, negative for deductions
  description TEXT NOT NULL,
  reference_id UUID, -- Reference to screening_result, purchase, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Point Packages Table
CREATE TABLE IF NOT EXISTS public.point_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in cents to avoid floating point issues
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================
-- 3. JOB COLLABORATION TABLES
-- ==============================================

-- Job Invitations Table
CREATE TABLE IF NOT EXISTS public.job_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job Collaborators Table
CREATE TABLE IF NOT EXISTS public.job_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('collaborator', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- ==============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_collaborators ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. RLS POLICIES
-- ==============================================

-- Company Profiles Policies
DROP POLICY IF EXISTS "Companies can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can update their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can insert their own profile" ON public.company_profiles;

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

-- Jobs Policies (with collaboration support)
DROP POLICY IF EXISTS "Companies can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Companies can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Companies and collaborators can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Companies and collaborators can delete jobs" ON public.jobs;

CREATE POLICY "Companies can view their own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_profiles.id = jobs.company_profile_id 
    AND company_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.job_collaborators 
    WHERE job_collaborators.job_id = jobs.id 
    AND job_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Companies can insert their own jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_profiles.id = jobs.company_profile_id 
    AND company_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Companies and collaborators can update jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_profiles.user_id = auth.uid() 
    AND company_profiles.id = jobs.company_profile_id
  ) OR EXISTS (
    SELECT 1 FROM public.job_collaborators 
    WHERE job_collaborators.job_id = jobs.id 
    AND job_collaborators.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_profiles.user_id = auth.uid() 
    AND company_profiles.id = company_profile_id
  ) OR EXISTS (
    SELECT 1 FROM public.job_collaborators 
    WHERE job_collaborators.job_id = jobs.id 
    AND job_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Companies and collaborators can delete jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.company_profiles 
    WHERE company_profiles.user_id = auth.uid() 
    AND company_profiles.id = jobs.company_profile_id
  ) OR EXISTS (
    SELECT 1 FROM public.job_collaborators 
    WHERE job_collaborators.job_id = jobs.id 
    AND job_collaborators.user_id = auth.uid()
  ));

-- Applications Policies
DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.applications;

CREATE POLICY "Companies can view applications for their jobs" 
  ON public.applications 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.company_profiles ON company_profiles.id = jobs.company_profile_id
    WHERE jobs.id = applications.job_id 
    AND company_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.job_collaborators ON job_collaborators.job_id = jobs.id
    WHERE jobs.id = applications.job_id 
    AND job_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (true);

-- Screening Results Policies (with collaboration support)
DROP POLICY IF EXISTS "Companies can view screening results for their jobs" ON public.screening_results;
DROP POLICY IF EXISTS "Companies can update screening results for their jobs" ON public.screening_results;

CREATE POLICY "Companies can view screening results for their jobs" 
  ON public.screening_results 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.company_profiles ON company_profiles.id = jobs.company_profile_id
    WHERE jobs.id = screening_results.job_id 
    AND company_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.job_collaborators ON job_collaborators.job_id = jobs.id
    WHERE jobs.id = screening_results.job_id 
    AND job_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Companies can update screening results for their jobs" 
  ON public.screening_results 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.company_profiles ON company_profiles.id = jobs.company_profile_id
    WHERE jobs.id = screening_results.job_id 
    AND company_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.jobs 
    JOIN public.job_collaborators ON job_collaborators.job_id = jobs.id
    WHERE jobs.id = screening_results.job_id 
    AND job_collaborators.user_id = auth.uid()
  ));

-- Points Policies
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can insert their own points" ON public.user_points;

CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.point_transactions;

CREATE POLICY "Users can view their own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active point packages" ON public.point_packages;
CREATE POLICY "Anyone can view active point packages" ON public.point_packages FOR SELECT USING (is_active = true);

-- Job Invitations Policies
DROP POLICY IF EXISTS "Users can view invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can update invitations for their jobs" ON public.job_invitations;
DROP POLICY IF EXISTS "Users can delete invitations for their jobs" ON public.job_invitations;

CREATE POLICY "Users can view invitations for their jobs" 
  ON public.job_invitations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_invitations.job_id 
    AND jobs.company_profile_id IN (
      SELECT id FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create invitations for their jobs" 
  ON public.job_invitations 
  FOR INSERT 
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update invitations for their jobs" 
  ON public.job_invitations 
  FOR UPDATE 
  USING (
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete invitations for their jobs" 
  ON public.job_invitations 
  FOR DELETE 
  USING (
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_invitations.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Job Collaborators Policies
DROP POLICY IF EXISTS "Users can view collaborators for their jobs" ON public.job_collaborators;
DROP POLICY IF EXISTS "Users can add collaborators to their jobs" ON public.job_collaborators;
DROP POLICY IF EXISTS "Users can remove collaborators from their jobs" ON public.job_collaborators;

CREATE POLICY "Users can view collaborators for their jobs" 
  ON public.job_collaborators 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add collaborators to their jobs" 
  ON public.job_collaborators 
  FOR INSERT 
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can remove collaborators from their jobs" 
  ON public.job_collaborators 
  FOR DELETE 
  USING (
    invited_by = auth.uid() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_collaborators.job_id 
      AND jobs.company_profile_id IN (
        SELECT id FROM public.company_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- ==============================================
-- 6. CONSTRAINTS AND INDEXES
-- ==============================================

-- Unique Constraints
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_subscription_status ON public.company_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_company_profiles_subscription_plan ON public.company_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_jobs_company_profile_id ON public.jobs(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_resume_text ON public.applications USING gin(to_tsvector('english', resume_text));
CREATE INDEX IF NOT EXISTS idx_applications_upload_source ON public.applications(upload_source);
CREATE INDEX IF NOT EXISTS idx_applications_uploaded_by_company ON public.applications(uploaded_by_company);
CREATE INDEX IF NOT EXISTS idx_applications_processing_status ON public.applications(processing_status);
CREATE INDEX IF NOT EXISTS idx_screening_results_job_id ON public.screening_results(job_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_application_id ON public.screening_results(application_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_phone ON public.screening_results(candidate_phone);
CREATE INDEX IF NOT EXISTS idx_screening_results_voice_screening_requested ON public.screening_results(voice_screening_requested);
CREATE INDEX IF NOT EXISTS idx_screening_results_home_address ON public.screening_results(home_address);
CREATE INDEX IF NOT EXISTS idx_screening_results_is_favorite ON public.screening_results(is_favorite);
CREATE INDEX IF NOT EXISTS idx_screening_results_is_dismissed ON public.screening_results(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_packages_active ON public.point_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_id ON public.job_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_email ON public.job_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_job_invitations_token ON public.job_invitations(token);
CREATE INDEX IF NOT EXISTS idx_job_collaborators_job_id ON public.job_collaborators(job_id);
CREATE INDEX IF NOT EXISTS idx_job_collaborators_user_id ON public.job_collaborators(user_id);

-- ==============================================
-- 7. TRIGGERS AND FUNCTIONS
-- ==============================================

-- Company Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.create_company_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create company profile for all new users (B2B platform)
  INSERT INTO public.company_profiles (
    user_id, 
    company_name, 
    company_website,
    company_description,
    company_size,
    industry,
    address,
    phone,
    subscription_status
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
    'inactive'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_company_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_company_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_company_profile_for_user();

-- Job Count Management Functions
CREATE OR REPLACE FUNCTION reset_monthly_job_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = 0, 
      last_job_count_reset = now()
  WHERE last_job_count_reset < date_trunc('month', now());
END;
$$;

CREATE OR REPLACE FUNCTION increment_job_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = jobs_posted_this_month + 1
  WHERE id = NEW.company_profile_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_job_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.company_profiles 
  SET jobs_posted_this_month = GREATEST(0, jobs_posted_this_month - 1)
  WHERE id = OLD.company_profile_id;
  
  RETURN OLD;
END;
$$;

-- Job Count Triggers
DROP TRIGGER IF EXISTS increment_job_count_trigger ON public.jobs;
CREATE TRIGGER increment_job_count_trigger
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_count();

DROP TRIGGER IF EXISTS decrement_job_count_trigger ON public.jobs;
CREATE TRIGGER decrement_job_count_trigger
  AFTER DELETE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION decrement_job_count();

-- Points System Functions
CREATE OR REPLACE FUNCTION public.add_points(
  target_user_id UUID,
  points_to_add INTEGER,
  transaction_type TEXT,
  description TEXT,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance or create record if doesn't exist
  INSERT INTO public.user_points (user_id, points_balance)
  VALUES (target_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current balance
  SELECT points_balance INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  -- Update balance
  UPDATE public.user_points
  SET points_balance = points_balance + points_to_add,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Record transaction
  INSERT INTO public.point_transactions (user_id, transaction_type, points, description, reference_id)
  VALUES (target_user_id, transaction_type, points_to_add, description, reference_id);
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_points(
  target_user_id UUID,
  points_to_deduct INTEGER,
  transaction_type TEXT,
  description TEXT,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT points_balance INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  -- Check if user has enough points
  IF current_balance IS NULL OR current_balance < points_to_deduct THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  UPDATE public.user_points
  SET points_balance = points_balance - points_to_deduct,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Record transaction (negative points for deduction)
  INSERT INTO public.point_transactions (user_id, transaction_type, points, description, reference_id)
  VALUES (target_user_id, transaction_type, -points_to_deduct, description, reference_id);
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_points(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT COALESCE(points_balance, 0) INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(current_balance, 0);
END;
$$;

-- Points Deduction Triggers
CREATE OR REPLACE FUNCTION public.deduct_screening_points_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  points_deducted BOOLEAN;
BEGIN
  -- Get the user_id from the job's company profile
  SELECT cp.user_id INTO user_id
  FROM public.jobs j
  JOIN public.company_profiles cp ON j.company_profile_id = cp.id
  WHERE j.id = NEW.job_id;
  
  -- Check if user exists and has enough points
  IF user_id IS NOT NULL THEN
    -- Check if points have already been deducted for this screening result
    IF NOT EXISTS (
      SELECT 1 FROM public.point_transactions 
      WHERE reference_id = NEW.id 
      AND transaction_type = 'screening'
    ) THEN
      -- Deduct 1 point for resume screening
      SELECT public.deduct_points(
        user_id,
        1,
        'screening',
        'Resume screening completed',
        NEW.id
      ) INTO points_deducted;
      
      IF NOT points_deducted THEN
        RAISE WARNING 'Failed to deduct points for screening result %', NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_voice_interview_points_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  points_deducted BOOLEAN;
BEGIN
  -- Only process if interview_completed_at is being set (not null) and wasn't null before
  IF NEW.interview_completed_at IS NOT NULL AND OLD.interview_completed_at IS NULL THEN
    -- Get the user_id from the job's company profile
    SELECT cp.user_id INTO user_id
    FROM public.jobs j
    JOIN public.company_profiles cp ON j.company_profile_id = cp.id
    WHERE j.id = NEW.job_id;
    
    -- Check if user exists and has enough points
    IF user_id IS NOT NULL THEN
      -- Check if points have already been deducted for this voice interview
      IF NOT EXISTS (
        SELECT 1 FROM public.point_transactions 
        WHERE reference_id = NEW.id 
        AND transaction_type = 'voice_interview'
      ) THEN
        -- Deduct 2 points for voice interview
        SELECT public.deduct_points(
          user_id,
          2,
          'voice_interview',
          'Voice interview completed',
          NEW.id
        ) INTO points_deducted;
        
        IF NOT points_deducted THEN
          RAISE WARNING 'Failed to deduct points for voice interview %', NEW.id;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Points Deduction Triggers
DROP TRIGGER IF EXISTS trigger_deduct_screening_points ON public.screening_results;
CREATE TRIGGER trigger_deduct_screening_points
  AFTER INSERT ON public.screening_results
  FOR EACH ROW EXECUTE FUNCTION public.deduct_screening_points_trigger();

DROP TRIGGER IF EXISTS trigger_deduct_voice_interview_points ON public.screening_results;
CREATE TRIGGER trigger_deduct_voice_interview_points
  AFTER UPDATE ON public.screening_results
  FOR EACH ROW EXECUTE FUNCTION public.deduct_voice_interview_points_trigger();

-- Job Collaboration Functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.job_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_job_invitation(invitation_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.job_invitations 
  WHERE token = invitation_token 
  AND status = 'pending' 
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Get current user
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Check if user email matches invitation
  IF user_record.email != invitation_record.invited_email THEN
    RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Add user as collaborator
  INSERT INTO public.job_collaborators (job_id, user_id, invited_by)
  VALUES (invitation_record.job_id, user_record.id, invitation_record.invited_by)
  ON CONFLICT (job_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.job_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object('success', true, 'job_id', invitation_record.job_id);
END;
$$;

-- ==============================================
-- 8. STORAGE BUCKETS
-- ==============================================

-- Create company_uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company_uploads', 
  'company_uploads', 
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage policies for company uploads
CREATE POLICY "Company users can upload resumes" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can view their uploaded resumes" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can delete their uploaded resumes" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'company_uploads' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- 9. SAMPLE DATA
-- ==============================================

-- Insert sample point packages
INSERT INTO public.point_packages (name, points, price_cents, is_active) VALUES
('Starter Pack', 50, 5000, true),    -- $50 for 50 points
('Growth Pack', 100, 8000, true),    -- $80 for 100 points  
('Business Pack', 200, 15000, true), -- $150 for 200 points
('Enterprise Pack', 500, 25000, true) -- $250 for 500 points
ON CONFLICT DO NOTHING;

-- ==============================================
-- 10. COMMENTS
-- ==============================================

COMMENT ON TABLE public.company_profiles IS 'Company profiles for B2B platform - all users are companies';
COMMENT ON TABLE public.jobs IS 'Job postings by companies';
COMMENT ON TABLE public.applications IS 'Job applications from candidates with company upload support';
COMMENT ON TABLE public.screening_results IS 'AI screening results for applications with voice interview support';
COMMENT ON TABLE public.user_points IS 'User points balance for the platform';
COMMENT ON TABLE public.point_transactions IS 'Point transaction history';
COMMENT ON TABLE public.point_packages IS 'Available point packages for purchase';
COMMENT ON TABLE public.job_invitations IS 'Invitations to collaborate on jobs';
COMMENT ON TABLE public.job_collaborators IS 'Collaborators for job postings';

-- ==============================================
-- 11. COMPLETION MESSAGE
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📊 Tables created: company_profiles, jobs, applications, screening_results, user_points, point_transactions, point_packages, job_invitations, job_collaborators';
  RAISE NOTICE '🔒 RLS policies configured for all tables with collaboration support';
  RAISE NOTICE '⚡ Triggers and functions created for automation';
  RAISE NOTICE '📦 Sample point packages inserted';
  RAISE NOTICE '🗂️ Storage bucket created for company uploads';
  RAISE NOTICE '🚀 Ready to test signup functionality!';
END $$;
