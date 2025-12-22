-- Create the workout-videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-videos', 'workout-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'workout-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own videos
CREATE POLICY "Allow authenticated users to update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'workout-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own videos
CREATE POLICY "Allow authenticated users to delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'workout-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to view videos (since public=true, but policies are still needed)
CREATE POLICY "Allow public access to view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workout-videos');
