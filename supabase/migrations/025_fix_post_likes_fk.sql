-- Ensure post_likes table exists
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, profile_id)
);

-- Explicitly recreate the foreign key to ensure it's named correctly and triggers schema cache refresh
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'post_likes_post_id_fkey') THEN
        ALTER TABLE post_likes DROP CONSTRAINT post_likes_post_id_fkey;
    END IF;
END $$;

ALTER TABLE post_likes ADD CONSTRAINT post_likes_post_id_fkey 
    FOREIGN KEY (post_id) 
    REFERENCES social_posts(id) 
    ON DELETE CASCADE;

-- Enable RLS if not already enabled
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Re-apply policies just in case (IF NOT EXISTS is not standard for policies, so we drop first)
DROP POLICY IF EXISTS "Users can see likes on posts they can see" ON post_likes;
CREATE POLICY "Users can see likes on posts they can see" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;
CREATE POLICY "Users can unlike their own likes" ON post_likes FOR DELETE USING (auth.uid() = profile_id);
