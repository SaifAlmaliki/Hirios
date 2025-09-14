-- Add favorite and dismiss columns to screening_results table
-- This allows hiring managers to mark candidates as favorites or dismissed

ALTER TABLE public.screening_results 
ADD COLUMN is_favorite BOOLEAN DEFAULT false,
ADD COLUMN is_dismissed BOOLEAN DEFAULT false;

-- Create indexes for better query performance on filtering
CREATE INDEX idx_screening_results_is_favorite ON public.screening_results(is_favorite);
CREATE INDEX idx_screening_results_is_dismissed ON public.screening_results(is_dismissed);

-- Add comments to document the purpose
COMMENT ON COLUMN public.screening_results.is_favorite IS 'Indicates if the candidate is marked as favorite by hiring manager';
COMMENT ON COLUMN public.screening_results.is_dismissed IS 'Indicates if the candidate is dismissed by hiring manager';
