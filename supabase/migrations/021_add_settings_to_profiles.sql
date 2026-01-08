-- Add settings columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS units TEXT DEFAULT 'metric';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_settings JSONB DEFAULT '{"water": true, "workout": true, "meal": true, "general": true}';
