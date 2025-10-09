-- Migration: Add DELETE policy for screening_results table
-- Date: 2025-02-10
-- Description: Allow companies to delete screening results for their own jobs

-- Add DELETE policy for screening_results
-- Companies can delete screening results if they own the job
CREATE POLICY "Companies can delete screening results for their jobs" 
ON "public"."screening_results" 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM "public"."jobs"
    JOIN "public"."company_profiles" ON ("company_profiles"."id" = "jobs"."company_profile_id")
    WHERE ("jobs"."id" = "screening_results"."job_id") 
    AND ("company_profiles"."user_id" = "auth"."uid"())
  )
);

-- Add comment explaining the policy
COMMENT ON POLICY "Companies can delete screening results for their jobs" ON "public"."screening_results" IS 
'Allows company owners to delete screening results for jobs they own. Job collaborators cannot delete screening results.';

