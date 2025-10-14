-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos', 
  true,
  1048576, -- 1MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml']
);

-- Create RLS policy to allow authenticated users to upload their company logos
CREATE POLICY "Company users can upload their own logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create RLS policy to allow authenticated users to update their company logos
CREATE POLICY "Company users can update their own logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create RLS policy to allow authenticated users to delete their own logos
CREATE POLICY "Company users can delete their own logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create RLS policy to allow public read access to company logos
CREATE POLICY "Company logos are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'company-logos');
