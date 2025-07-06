
-- Make company_profile_id required for jobs table
ALTER TABLE public.jobs ALTER COLUMN company_profile_id SET NOT NULL;

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE public.jobs ADD CONSTRAINT jobs_company_profile_id_fkey 
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

-- Create index for better performance on company lookups
CREATE INDEX IF NOT EXISTS idx_jobs_company_profile_id ON public.jobs(company_profile_id);
