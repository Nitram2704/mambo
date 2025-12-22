-- Create enum for set types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workout_set_type') THEN
        CREATE TYPE workout_set_type AS ENUM ('warmup', 'normal', 'dropset', 'failure', 'rest_pause');
    END IF;
END $$;

-- Add set_type to workout_sets
ALTER TABLE workout_sets 
ADD COLUMN IF NOT EXISTS set_type workout_set_type DEFAULT 'normal';

-- Add planned_set_types to routine_exercises
ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS planned_set_types text[] DEFAULT ARRAY['normal', 'normal', 'normal'];

-- Add instructions/video URL to exercises if they don't exist
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT;
