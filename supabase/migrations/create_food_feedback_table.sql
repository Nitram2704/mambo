-- Create table for storing food analysis feedback
CREATE TABLE IF NOT EXISTS food_analysis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    ai_estimate JSONB NOT NULL,
    user_correction JSONB NOT NULL,
    food_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_feedback_user_id ON food_analysis_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_food_feedback_created_at ON food_analysis_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE food_analysis_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own feedback
CREATE POLICY "Users can view own feedback"
    ON food_analysis_feedback
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
    ON food_analysis_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own feedback
CREATE POLICY "Users can delete own feedback"
    ON food_analysis_feedback
    FOR DELETE
    USING (auth.uid() = user_id);
