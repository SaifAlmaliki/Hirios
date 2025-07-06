
-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  salary TEXT,
  requirements TEXT,
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - for now making it public for demo purposes
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (you can restrict this later with authentication)
CREATE POLICY "Allow public read access to jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete access to jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (true);

CREATE POLICY "Allow public read access to applications" 
  ON public.applications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to applications" 
  ON public.applications 
  FOR UPDATE 
  USING (true);
