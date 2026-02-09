-- Add AI Coach Pro setting to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_coach_enabled BOOLEAN DEFAULT FALSE;
