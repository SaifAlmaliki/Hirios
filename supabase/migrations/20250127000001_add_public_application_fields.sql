-- Add fields to resume_pool table for public job applications
-- This migration adds support for candidates applying directly via public links

-- Step 1: Make uploaded_by_user_id nullable for public applications
ALTER TABLE public.resume_pool
ALTER COLUMN uploaded_by_user_id DROP NOT NULL;

-- Step 2: Add new columns
ALTER TABLE public.resume_pool
ADD COLUMN IF NOT EXISTS job_id uuid NULL,
ADD COLUMN IF NOT EXISTS candidate_name text NULL,
ADD COLUMN IF NOT EXISTS upload_source text NOT NULL DEFAULT 'resume_pool';

-- Step 3: Add foreign key constraint for job_id
ALTER TABLE public.resume_pool
ADD CONSTRAINT resume_pool_job_id_fkey 
FOREIGN KEY (job_id) 
REFERENCES public.jobs(id) 
ON DELETE SET NULL;

-- Step 4: Create index on job_id for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_pool_job_id 
ON public.resume_pool USING btree (job_id) 
TABLESPACE pg_default;

-- Step 5: Create index on upload_source for filtering
CREATE INDEX IF NOT EXISTS idx_resume_pool_upload_source 
ON public.resume_pool USING btree (upload_source) 
TABLESPACE pg_default;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.resume_pool.job_id IS 'Reference to the job if this resume was submitted via public application link';
COMMENT ON COLUMN public.resume_pool.candidate_name IS 'Name of the candidate (for public applications before resume parsing)';
COMMENT ON COLUMN public.resume_pool.upload_source IS 'Source of upload: resume_pool (company upload) or public_application (candidate direct upload)';

-- Step 7: Add RLS policy to allow anonymous users to insert public applications
CREATE POLICY "Allow anonymous public job applications" 
ON "public"."resume_pool" 
FOR INSERT 
TO "anon"
WITH CHECK (
  upload_source = 'public_application' 
  AND job_id IS NOT NULL
  AND candidate_name IS NOT NULL
);

-- Add comment explaining the policy
COMMENT ON POLICY "Allow anonymous public job applications" ON "public"."resume_pool" IS 
'Allows anonymous users to submit job applications via public job links. Requires upload_source to be public_application, a valid job_id, and candidate_name.';
