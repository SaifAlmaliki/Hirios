-- Add reject fields to screening_results table
ALTER TABLE "public"."screening_results" 
ADD COLUMN "is_rejected" boolean DEFAULT false,
ADD COLUMN "rejected_at" timestamp with time zone;

-- Add comment for the new fields
COMMENT ON COLUMN "public"."screening_results"."is_rejected" IS 'Indicates if the candidate has been rejected';
COMMENT ON COLUMN "public"."screening_results"."rejected_at" IS 'Timestamp when the candidate was rejected';
