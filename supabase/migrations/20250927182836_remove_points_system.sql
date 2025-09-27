-- Remove points system functions and tables
-- This migration removes the points system that is no longer needed

-- Drop points-related functions
DROP FUNCTION IF EXISTS "public"."add_points"("target_user_id" "uuid", "points_to_add" integer, "transaction_type" "text", "description" "text", "reference_id" "uuid");
DROP FUNCTION IF EXISTS "public"."deduct_points"("target_user_id" "uuid", "points_to_deduct" integer, "transaction_type" "text", "description" "text", "reference_id" "uuid");
DROP FUNCTION IF EXISTS "public"."get_user_points"("target_user_id" "uuid");

-- Drop points-related tables if they exist
DROP TABLE IF EXISTS "public"."point_transactions";
DROP TABLE IF EXISTS "public"."user_points";

-- Note: The points system has been removed as it's no longer needed
-- Points functionality will be handled by application code if required
