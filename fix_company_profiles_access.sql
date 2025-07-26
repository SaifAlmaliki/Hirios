-- Fix company_profiles access issue
-- Run this in your Supabase SQL Editor

-- Allow public read access to company_profiles table
CREATE POLICY "Public read access for company profiles" 
  ON public.company_profiles 
  FOR SELECT 
  USING (true);

-- Also add public read access to profiles table if needed
CREATE POLICY "Public read access for profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
