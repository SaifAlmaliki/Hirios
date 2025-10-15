-- Migration: Auto-update candidate status when screening results are created
-- Date: 2025-01-28
-- Description: Automatically update candidate status to 'screened' when screening_results record is created

-- Create function to automatically update candidate status when screening result is created
CREATE OR REPLACE FUNCTION auto_update_candidate_status_on_screening()
RETURNS TRIGGER AS $$
DECLARE
    resume_pool_id_val UUID;
    job_id_val UUID;
    user_id_val UUID;
BEGIN
    -- Get the resume_pool_id from the application
    IF NEW.application_id IS NOT NULL THEN
        SELECT resume_pool_id INTO resume_pool_id_val
        FROM applications
        WHERE id = NEW.application_id;
        
        -- Get job_id from the screening result
        job_id_val := NEW.job_id;
        
        -- Get a system user ID for automated updates
        -- Try to get a system user, fallback to a default UUID
        SELECT id INTO user_id_val
        FROM auth.users
        WHERE email = 'system@hirios.com'
        LIMIT 1;
        
        -- If no system user found, use a default UUID
        IF user_id_val IS NULL THEN
            user_id_val := '00000000-0000-0000-0000-000000000000';
        END IF;
        
        -- Only proceed if we have both resume_pool_id and job_id
        IF resume_pool_id_val IS NOT NULL AND job_id_val IS NOT NULL THEN
            -- Insert or update candidate status to 'screened'
            INSERT INTO candidate_status (
                resume_pool_id,
                job_id,
                status,
                updated_by_user_id,
                created_at,
                updated_at
            ) VALUES (
                resume_pool_id_val,
                job_id_val,
                'screened',
                user_id_val,
                NOW(),
                NOW()
            )
            ON CONFLICT (resume_pool_id, job_id)
            DO UPDATE SET
                status = 'screened',
                updated_by_user_id = user_id_val,
                updated_at = NOW();
                
            RAISE NOTICE 'Updated candidate status to screened for resume_pool_id: %, job_id: %', resume_pool_id_val, job_id_val;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when screening_results is inserted
CREATE TRIGGER trigger_auto_update_candidate_status_on_screening
    AFTER INSERT ON screening_results
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_candidate_status_on_screening();

-- Add comment explaining the trigger
COMMENT ON FUNCTION auto_update_candidate_status_on_screening() IS 
'Automatically updates candidate status to screened when a screening result is created';

COMMENT ON TRIGGER trigger_auto_update_candidate_status_on_screening ON screening_results IS 
'Triggers automatic candidate status update when screening results are created';
