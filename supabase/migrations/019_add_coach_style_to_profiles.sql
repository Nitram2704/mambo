-- Add coach_style column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_style TEXT DEFAULT 'amigo';
