-- Migration: Add anonymous access policy for resume_pool table
-- Date: 2025-02-11
-- Description: Allow anonymous users to access resume_pool data for voice interviews

-- Add policy to allow anonymous access to resume_pool for voice interviews
CREATE POLICY "Allow public access to resume_pool for voice interviews" 
ON "public"."resume_pool" 
FOR SELECT 
TO "anon" 
USING (true);

-- Add comment explaining the policy
COMMENT ON POLICY "Allow public access to resume_pool for voice interviews" ON "public"."resume_pool" IS 
'Allows anonymous users to access resume data for voice interviews. This is necessary for candidates to access their interview links without authentication.';
