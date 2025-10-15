-- Diagnostic query to understand the current status issue
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check screening results for the specific job
SELECT 
    'Screening Results' as table_name,
    sr.id,
    sr.job_id,
    sr.application_id,
    sr.first_name,
    sr.last_name,
    sr.created_at
FROM screening_results sr
WHERE sr.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
ORDER BY sr.created_at DESC;

-- 2. Check applications for this job
SELECT 
    'Applications' as table_name,
    a.id,
    a.job_id,
    a.resume_pool_id,
    a.uploaded_by_user_id,
    a.created_at
FROM applications a
WHERE a.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
ORDER BY a.created_at DESC;

-- 3. Check current candidate status
SELECT 
    'Candidate Status' as table_name,
    cs.id,
    cs.resume_pool_id,
    cs.job_id,
    cs.status,
    cs.updated_at
FROM candidate_status cs
WHERE cs.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
ORDER BY cs.updated_at DESC;

-- 4. Check resume pool for this job's applications
SELECT 
    'Resume Pool' as table_name,
    rp.id,
    rp.original_filename,
    rp.company_profile_id,
    rp.created_at
FROM resume_pool rp
WHERE rp.id IN (
    SELECT DISTINCT a.resume_pool_id 
    FROM applications a 
    WHERE a.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376'
)
ORDER BY rp.created_at DESC;

-- 5. Check if there are any missing links
SELECT 
    'Missing Links' as issue_type,
    sr.id as screening_result_id,
    sr.application_id,
    a.resume_pool_id,
    CASE 
        WHEN sr.application_id IS NULL THEN 'No application_id in screening_result'
        WHEN a.resume_pool_id IS NULL THEN 'No resume_pool_id in application'
        ELSE 'All links present'
    END as issue_description
FROM screening_results sr
LEFT JOIN applications a ON sr.application_id = a.id
WHERE sr.job_id = '9c34430d-b76b-4c17-a7d4-ccf573a4f376';
