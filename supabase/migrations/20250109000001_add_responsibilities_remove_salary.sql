-- Add responsibilities column and remove salary column from jobs table
-- Migration: Add responsibilities field and remove salary field

-- Add responsibilities column (required field)
ALTER TABLE public.jobs 
ADD COLUMN responsibilities TEXT NOT NULL DEFAULT '';

-- Remove salary column
ALTER TABLE public.jobs 
DROP COLUMN salary;

-- Update the responsibilities column to remove the default value constraint
-- (keeping it NOT NULL but removing the default empty string)
ALTER TABLE public.jobs 
ALTER COLUMN responsibilities DROP DEFAULT; 