-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Social Groups
CREATE TABLE IF NOT EXISTS social_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('couple', 'friends', 'community')),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES social_groups(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, profile_id)
);

-- Wagers (Bets/Challenges)
CREATE TABLE IF NOT EXISTS wagers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES social_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stake TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    winner_id UUID REFERENCES profiles(id),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts (Workout Proof)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    media_url TEXT,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach-Client Relationships
CREATE TABLE IF NOT EXISTS coach_clients (
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (coach_id, client_id)
);

-- Enable RLS
ALTER TABLE social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified for now, can be refined)
CREATE POLICY "Users can see groups they are members of" ON social_groups
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = social_groups.id AND profile_id = auth.uid())
    );

CREATE POLICY "Members can see other members in their groups" ON group_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.profile_id = auth.uid())
    );

CREATE POLICY "Members can see wagers in their groups" ON wagers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = wagers.group_id AND profile_id = auth.uid())
    );

CREATE POLICY "Users can see posts from their group members" ON social_posts
    FOR SELECT USING (true); -- Public for now, can be restricted to friends/groups later

CREATE POLICY "Coaches can see their clients" ON coach_clients
    FOR SELECT USING (coach_id = auth.uid() OR client_id = auth.uid());
