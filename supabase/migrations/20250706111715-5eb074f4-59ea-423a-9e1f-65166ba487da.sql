
-- Create a table for screening results
CREATE TABLE public.screening_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  job_role TEXT NOT NULL,
  resume TEXT NOT NULL,
  fit_score INTEGER,
  screening_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to control access
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (similar to other tables in your app)
CREATE POLICY "Allow public read access to screening_results" 
  ON public.screening_results 
  FOR SELECT 
  USING (true);

-- Create policy for public insert access
CREATE POLICY "Allow public insert access to screening_results" 
  ON public.screening_results 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Allow public update access to screening_results" 
  ON public.screening_results 
  FOR UPDATE 
  USING (true);

-- Create policy for public delete access
CREATE POLICY "Allow public delete access to screening_results" 
  ON public.screening_results 
  FOR DELETE 
  USING (true);
