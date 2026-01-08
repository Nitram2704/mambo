-- Create sleep_logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    bed_time TIMESTAMP WITH TIME ZONE NOT NULL,
    wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    quality INTEGER CHECK (quality >= 1 AND quality <= 5),
    notes TEXT,
    tags TEXT[], -- Array of strings
    daily_score INTEGER,
    noise_events INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sleep logs" ON sleep_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep logs" ON sleep_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep logs" ON sleep_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep logs" ON sleep_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id_date ON sleep_logs(user_id, date);
