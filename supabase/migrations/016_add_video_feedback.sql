-- Add video_url to workout_exercises for user feedback
ALTER TABLE workout_exercises
ADD COLUMN IF NOT EXISTS video_url TEXT;
