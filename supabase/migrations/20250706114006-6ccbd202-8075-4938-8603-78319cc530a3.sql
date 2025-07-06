
-- Check current RLS policies and potentially adjust them for external API access
-- First, let's see if we need to add a policy specifically for service role access

-- Drop existing policies to recreate them with better external access
DROP POLICY IF EXISTS "Allow public read access to screening_results" ON public.screening_results;
DROP POLICY IF EXISTS "Allow public insert access to screening_results" ON public.screening_results;
DROP POLICY IF EXISTS "Allow public update access to screening_results" ON public.screening_results;
DROP POLICY IF EXISTS "Allow public delete access to screening_results" ON public.screening_results;

-- Create new policies that work better with external services
CREATE POLICY "Enable read access for all users" ON public.screening_results
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.screening_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.screening_results
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.screening_results
  FOR DELETE USING (true);
