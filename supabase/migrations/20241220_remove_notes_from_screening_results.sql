-- Remove the notes column from screening_results table since we now use the candidate_comments table
ALTER TABLE screening_results DROP COLUMN IF EXISTS notes;

-- Add comment to document the change
COMMENT ON TABLE screening_results IS 'AI-powered candidate screening and evaluation results. Notes functionality moved to candidate_comments table for better organization and history tracking.';
