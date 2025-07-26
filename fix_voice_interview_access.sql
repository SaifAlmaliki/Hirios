-- Fix voice interview access by allowing public read access to necessary tables
-- Run this in your Supabase SQL Editor

-- Allow public read access to screening_results for voice interviews
CREATE POLICY "Public read access for screening results" 
  ON public.screening_results 
  FOR SELECT 
  USING (true);

-- Allow public read access to jobs table for voice interviews  
CREATE POLICY "Public read access for jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (true);

-- Allow public read access to applications table for resume data
CREATE POLICY "Public read access for applications" 
  ON public.applications 
  FOR SELECT 
  USING (true);
