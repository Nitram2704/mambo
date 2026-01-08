-- Create Enum for Subscription Tiers
CREATE TYPE subscription_tier AS ENUM ('STARTER', 'PRO', 'ELITE');

-- Create User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id subscription_tier NOT NULL DEFAULT 'STARTER',
    
    -- Usage Counters (Reset periodically)
    cv_credits_used_monthly INTEGER NOT NULL DEFAULT 0,
    chat_tokens_used_daily INTEGER NOT NULL DEFAULT 0,
    
    -- Feature Flags (Cached from Tier Config for faster lookup, or can be overrides)
    feature_rag_memory BOOLEAN NOT NULL DEFAULT FALSE,
    feature_nutrition_vision BOOLEAN NOT NULL DEFAULT FALSE,
    feature_barcode_scanner BOOLEAN NOT NULL DEFAULT TRUE, -- Starter has it enabled
    feature_agent_actions BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Metadata
    valid_until TIMESTAMPTZ, -- For expiration check
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscription"
    ON user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role (or specific admin functions) should update subscriptions
-- But for now, we might allow users to update via specific RPCs or edge functions.
-- For dev/testing, we'll allow update for self (to switch tiers in Dev Menu).
CREATE POLICY "Users can update their own subscription (DEV ONLY)"
    ON user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger to create subscription on user signup (optional, but good practice)
-- For now, we will handle creation in the store if it doesn't exist.
