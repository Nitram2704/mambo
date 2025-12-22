-- Create routines and routine_exercises tables

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routine_exercises table
CREATE TABLE IF NOT EXISTS routine_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    exercise_id TEXT NOT NULL, -- Local exercise id as string
    "order" INTEGER NOT NULL,
    planned_sets INTEGER DEFAULT 3,
    rest_time INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);

-- RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for routines
DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
CREATE POLICY "Users can view their own routines" ON routines
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own routines" ON routines;
CREATE POLICY "Users can insert their own routines" ON routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own routines" ON routines;
CREATE POLICY "Users can update their own routines" ON routines
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own routines" ON routines;
CREATE POLICY "Users can delete their own routines" ON routines
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for routine_exercises
DROP POLICY IF EXISTS "Users can view exercises from their routines" ON routine_exercises;
CREATE POLICY "Users can view exercises from their routines" ON routine_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_exercises.routine_id
            AND routines.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert exercises to their routines" ON routine_exercises;
CREATE POLICY "Users can insert exercises to their routines" ON routine_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_exercises.routine_id
            AND routines.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update exercises in their routines" ON routine_exercises;
CREATE POLICY "Users can update exercises in their routines" ON routine_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_exercises.routine_id
            AND routines.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete exercises from their routines" ON routine_exercises;
CREATE POLICY "Users can delete exercises from their routines" ON routine_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = routine_exercises.routine_id
            AND routines.user_id = auth.uid()
        )
    );