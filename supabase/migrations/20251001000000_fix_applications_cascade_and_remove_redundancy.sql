-- Migration: Fix applications cascade deletion and remove redundant columns
-- Date: 2025-10-01
-- Description: 
--   1. Add ON DELETE CASCADE to applications.job_id foreign key
--   2. Remove redundant columns from applications (resume_url, resume_text, storage_path)
--   3. Remove redundant columns from screening_results (resume_url, resume_text)
--   4. Make applications.resume_pool_id NOT NULL with ON DELETE CASCADE

-- Step 1: Drop existing foreign key constraint on applications.job_id if it exists
-- Note: The original schema doesn't have a foreign key, but we'll be safe
DO $$ 
BEGIN
    -- Check if constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_job_id_fkey' 
        AND table_name = 'applications'
    ) THEN
        ALTER TABLE public.applications DROP CONSTRAINT applications_job_id_fkey;
    END IF;
END $$;

-- Step 2: Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.applications
ADD CONSTRAINT applications_job_id_fkey 
FOREIGN KEY (job_id) 
REFERENCES public.jobs(id) 
ON DELETE CASCADE;

-- Step 3: Update applications.resume_pool_id constraint to ON DELETE CASCADE
-- First drop existing constraint
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_resume_pool_id_fkey;

-- Add new constraint with CASCADE and make it NOT NULL
-- Note: This assumes all existing applications have resume_pool_id populated
-- If not, you'll need to populate them first
ALTER TABLE public.applications
ALTER COLUMN resume_pool_id SET NOT NULL;

ALTER TABLE public.applications
ADD CONSTRAINT applications_resume_pool_id_fkey 
FOREIGN KEY (resume_pool_id) 
REFERENCES public.resume_pool(id) 
ON DELETE CASCADE;

-- Step 4: Remove redundant columns from applications table
ALTER TABLE public.applications 
DROP COLUMN IF EXISTS resume_url,
DROP COLUMN IF EXISTS resume_text,
DROP COLUMN IF EXISTS storage_path;

-- Step 5: Drop related indexes that are no longer needed
DROP INDEX IF EXISTS public.idx_applications_storage_path;

-- Step 6: Remove redundant columns from screening_results table
ALTER TABLE public.screening_results 
DROP COLUMN IF EXISTS resume_url,
DROP COLUMN IF EXISTS resume_text;

-- Verification: Show updated table structures
COMMENT ON TABLE public.applications IS 'Applications now cascade delete with jobs and resume_pool. Resume data accessed via resume_pool_id.';
COMMENT ON TABLE public.screening_results IS 'Screening results cascade delete with jobs. Resume data accessed via application_id -> resume_pool_id.';
