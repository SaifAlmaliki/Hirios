-- Add job_id and notes columns to screening_results table
-- This allows linking screening results to specific job postings and company notes

ALTER TABLE public.screening_results 
ADD COLUMN job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
ADD COLUMN notes text;

-- Create index for better query performance
CREATE INDEX idx_screening_results_job_id ON public.screening_results(job_id);

-- Add comment to document the purpose
COMMENT ON COLUMN public.screening_results.job_id IS 'Links screening result to specific job posting';
COMMENT ON COLUMN public.screening_results.notes IS 'Company notes about the candidate'; 