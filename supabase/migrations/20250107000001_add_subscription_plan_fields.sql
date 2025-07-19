-- Add subscription plan and job posting limit fields to company_profiles
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS jobs_posted_this_month INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_job_count_reset TIMESTAMPTZ DEFAULT now();

-- Create index for better performance on subscription plan queries
CREATE INDEX IF NOT EXISTS idx_company_profiles_subscription_plan ON public.company_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON public.company_profiles(user_id);

-- Create function to reset monthly job counts
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

-- Update existing RLS policy for job insertion to include job posting limits
DROP POLICY IF EXISTS "Companies can insert jobs" ON public.jobs;

-- Create new policy that enforces job posting limits for free accounts
CREATE POLICY "Companies can insert jobs with limits" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles 
      WHERE company_profiles.user_id = auth.uid() 
      AND company_profiles.id = jobs.company_profile_id
      AND (
        -- Premium users have unlimited job postings
        company_profiles.subscription_plan = 'premium' 
        OR 
        -- Free users can post up to 2 jobs per month
        (company_profiles.subscription_plan = 'free' AND company_profiles.jobs_posted_this_month < 2)
      )
    )
  );

-- Create function to increment job count after job insertion
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

-- Create trigger to increment job count after job insertion
DROP TRIGGER IF EXISTS increment_job_count_trigger ON public.jobs;
CREATE TRIGGER increment_job_count_trigger
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_count();

-- Create function to decrement job count after job deletion
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

-- Create trigger to decrement job count after job deletion
DROP TRIGGER IF EXISTS decrement_job_count_trigger ON public.jobs;
CREATE TRIGGER decrement_job_count_trigger
  AFTER DELETE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION decrement_job_count(); 