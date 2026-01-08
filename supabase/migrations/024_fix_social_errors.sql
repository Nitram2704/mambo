-- Create storage bucket for social posts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social_posts', 'social_posts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'social_posts' );

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'social_posts' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own images
CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'social_posts' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'social_posts' AND auth.uid()::text = (storage.foldername(name))[1] );
