-- Update screening_results table for voice interview functionality
-- Add voice screening request flag and interview summary
-- Remove old call tracking columns

-- Add new columns for voice screening
ALTER TABLE public.screening_results 
ADD COLUMN voice_screening_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN interview_summary TEXT,
ADD COLUMN interview_completed_at TIMESTAMPTZ;

-- Remove old call tracking columns
ALTER TABLE public.screening_results 
DROP COLUMN IF EXISTS call_status,
DROP COLUMN IF EXISTS call_initiated_at,
DROP COLUMN IF EXISTS call_completed_at,
DROP COLUMN IF EXISTS call_summary,
DROP COLUMN IF EXISTS call_error_message;

-- Create indexes for better query performance
CREATE INDEX idx_screening_results_voice_screening_requested ON public.screening_results(voice_screening_requested);

-- Add comments to document the purpose
COMMENT ON COLUMN public.screening_results.voice_screening_requested IS 'Flag indicating if voice screening interview has been requested by recruiter';
COMMENT ON COLUMN public.screening_results.interview_summary IS 'AI-generated summary of the voice screening interview (populated by n8n)';
COMMENT ON COLUMN public.screening_results.interview_completed_at IS 'Timestamp when voice interview was completed';

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_screening_results_call_status; 