-- Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add missing columns to social_posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS is_proof BOOLEAN DEFAULT FALSE;

-- Add missing columns to wagers
ALTER TABLE wagers ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('consistency', 'weight', 'volume')) DEFAULT 'consistency';
ALTER TABLE wagers ADD COLUMN IF NOT EXISTS goal NUMERIC;

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, profile_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_feedback table
CREATE TABLE IF NOT EXISTS workout_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see likes on posts they can see" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can unlike their own likes" ON post_likes
    FOR DELETE USING (auth.uid() = profile_id);

CREATE POLICY "Users can see comments on posts they can see" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment on posts" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = profile_id);

CREATE POLICY "Coaches and clients can see feedback" ON workout_feedback
    FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Coaches can give feedback" ON workout_feedback
    FOR INSERT WITH CHECK (auth.uid() = coach_id);
