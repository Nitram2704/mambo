-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id TEXT NOT NULL DEFAULT 'STARTER' CHECK (tier_id IN ('STARTER', 'PRO', 'ELITE')),
    cv_credits_used_monthly INTEGER NOT NULL DEFAULT 0,
    chat_tokens_used_daily INTEGER NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription"
    ON user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own subscription (for usage tracking)
CREATE POLICY "Users can update own subscription"
    ON user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can insert own subscription"
    ON user_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset daily chat limits (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_daily_chat_limits()
RETURNS void AS $$
BEGIN
    UPDATE user_subscriptions
    SET chat_tokens_used_daily = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset monthly CV credits (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_monthly_cv_credits()
RETURNS void AS $$
BEGIN
    UPDATE user_subscriptions
    SET cv_credits_used_monthly = 0;
END;
$$ LANGUAGE plpgsql;
