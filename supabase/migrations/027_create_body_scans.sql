-- Create the body-scans bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('body-scans', 'body-scans', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to upload body scans' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated users to upload body scans"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'body-scans' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access to view body scans' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow public access to view body scans"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'body-scans');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to delete their own body scans' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated users to delete their own body scans"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'body-scans' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;

-- Create the body_scans table
CREATE TABLE IF NOT EXISTS body_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  front_photo_url TEXT,
  side_photo_url TEXT,
  back_photo_url TEXT,
  analysis_json JSONB,
  metrics JSONB, -- { v_taper: number, symmetry: number, body_fat: number, lean_mass: number }
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for table
ALTER TABLE body_scans ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own body scans') THEN
        CREATE POLICY "Users can view their own body scans"
          ON body_scans FOR SELECT
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own body scans') THEN
        CREATE POLICY "Users can insert their own body scans"
          ON body_scans FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own body scans') THEN
        CREATE POLICY "Users can delete their own body scans"
          ON body_scans FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;
