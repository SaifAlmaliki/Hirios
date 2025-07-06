
-- Create settings table to store webhook URL and other configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings table (allowing public access for webhook configuration)
CREATE POLICY "Allow public read access to settings" 
  ON public.settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to settings" 
  ON public.settings 
  FOR UPDATE 
  USING (true);

-- Insert default webhook URL
INSERT INTO public.settings (key, value) 
VALUES ('webhook_url', 'https://n8n.cognitechx.com/webhook-test/application')
ON CONFLICT (key) DO NOTHING;
