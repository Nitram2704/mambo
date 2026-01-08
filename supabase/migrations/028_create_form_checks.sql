-- Create form_checks table
CREATE TABLE IF NOT EXISTS form_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  analysis_json JSONB,
  score INT CHECK (score >= 0 AND score <= 100),
  feedback TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE form_checks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own form checks"
  ON form_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own form checks"
  ON form_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own form checks"
  ON form_checks FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for workout videos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-videos', 'workout-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for workout videos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to upload workout videos' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated users to upload workout videos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'workout-videos' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to view their own workout videos' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow users to view their own workout videos"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
            bucket_id = 'workout-videos' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to delete their own workout videos' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow users to delete their own workout videos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'workout-videos' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;
