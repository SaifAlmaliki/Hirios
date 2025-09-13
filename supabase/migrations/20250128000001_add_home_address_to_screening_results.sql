-- Add home_address column to screening_results table
-- This allows storing candidate's home address for location-based screening and analysis

ALTER TABLE public.screening_results 
ADD COLUMN home_address TEXT;

-- Create index for better query performance on address searches
CREATE INDEX IF NOT EXISTS idx_screening_results_home_address ON public.screening_results(home_address);

-- Add comment to document the purpose
COMMENT ON COLUMN public.screening_results.home_address IS 'Candidate home address for location-based screening and analysis';
