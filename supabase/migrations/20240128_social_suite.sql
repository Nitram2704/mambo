-- Update existing social_posts table to include workout_data
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_posts' AND column_name='workout_data') THEN
        ALTER TABLE public.social_posts ADD COLUMN workout_data JSONB;
    END IF;
END $$;

-- Realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'social_posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
    END IF;
END $$;
