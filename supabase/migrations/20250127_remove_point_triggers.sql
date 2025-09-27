-- Remove point-related triggers and functions
-- This migration removes triggers that reference the deleted point_transactions table

-- Remove triggers from screening_results table
DROP TRIGGER IF EXISTS trigger_deduct_screening_points ON screening_results;
DROP TRIGGER IF EXISTS trigger_deduct_voice_interview_points ON screening_results;

-- Remove the trigger functions
DROP FUNCTION IF EXISTS deduct_screening_points_trigger();
DROP FUNCTION IF EXISTS deduct_voice_interview_points_trigger();
