-- Security Hardening Migration
-- Targets: OWASP A01 (Broken Access Control)

-- 1. Hardening Social Posts (Restrict to Authenticated Users)
DROP POLICY IF EXISTS "Users can see posts from their group members" ON social_posts;
CREATE POLICY "Users can see posts if authenticated" ON social_posts
    FOR SELECT TO authenticated USING (true);

-- 2. Hardening Group Members (Fix Join Logic)
-- Previous policy allowed anyone to join any group because of 'or auth.uid() = user_id'
DROP POLICY IF EXISTS "Members can see other members in their groups" ON public.group_members;
CREATE POLICY "Members can see other members in their groups" ON public.group_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.profile_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups" ON public.group_members 
    FOR INSERT TO authenticated 
    WITH CHECK (
        (exists (
            select 1 from public.social_groups 
            where id = group_id AND (type = 'community' OR created_by = auth.uid())
        )) AND (auth.uid() = profile_id)
    );

-- 3. Hardening Storage (Workout Videos)
-- Make bucket private (requires policy for read)
UPDATE storage.buckets SET public = false WHERE id = 'workout-videos';

-- Tighten read access to only authenticated users (previously public)
DROP POLICY IF EXISTS "Allow public access to view videos" ON storage.objects;
CREATE POLICY "Allow authenticated users to view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workout-videos');

-- 4. Hardening Profiles (Ensure users can only update their own profile)
-- (Double checking existing policies, adding if missing)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Hardening Workouts (Ensure users can only see their own workouts)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see own workouts" ON workouts;
CREATE POLICY "Users can see own workouts" ON workouts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
