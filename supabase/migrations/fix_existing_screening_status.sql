-- Fix existing screening results to have correct candidate status
-- This will update all existing screening results to have 'screened' status

-- First, let's see what we're working with
SELECT 
    sr.id as screening_result_id,
    sr.job_id,
    sr.application_id,
    a.resume_pool_id,
    cs.status as current_status
FROM screening_results sr
LEFT JOIN applications a ON sr.application_id = a.id
LEFT JOIN candidate_status cs ON a.resume_pool_id = cs.resume_pool_id AND sr.job_id = cs.job_id
WHERE sr.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
ORDER BY sr.created_at DESC;

-- Update existing candidate status for all screening results
-- This will create or update candidate_status records for existing screening results
INSERT INTO candidate_status (
    resume_pool_id,
    job_id,
    status,
    updated_by_user_id,
    created_at,
    updated_at
)
SELECT DISTINCT
    a.resume_pool_id,
    sr.job_id,
    'screened' as status,
    '00000000-0000-0000-0000-000000000000' as updated_by_user_id,
    sr.created_at,
    NOW() as updated_at
FROM screening_results sr
JOIN applications a ON sr.application_id = a.id
WHERE sr.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
  AND a.resume_pool_id IS NOT NULL
ON CONFLICT (resume_pool_id, job_id)
DO UPDATE SET
    status = 'screened',
    updated_at = NOW();

-- Verify the update worked
SELECT 
    sr.id as screening_result_id,
    sr.job_id,
    sr.application_id,
    a.resume_pool_id,
    cs.status as updated_status,
    cs.updated_at
FROM screening_results sr
LEFT JOIN applications a ON sr.application_id = a.id
LEFT JOIN candidate_status cs ON a.resume_pool_id = cs.resume_pool_id AND sr.job_id = cs.job_id
WHERE sr.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
ORDER BY sr.created_at DESC;
