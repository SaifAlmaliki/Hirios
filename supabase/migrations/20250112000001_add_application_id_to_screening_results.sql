-- Add application_id column to screening_results table
-- This allows linking screening results to specific applications for more precise candidate identification

ALTER TABLE public.screening_results 
ADD COLUMN application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_screening_results_application_id ON public.screening_results(application_id);

-- Add comment to document the purpose
COMMENT ON COLUMN public.screening_results.application_id IS 'Links screening result to specific application for precise candidate identification'; 