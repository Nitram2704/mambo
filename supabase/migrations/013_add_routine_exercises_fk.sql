-- Fix PGRST200: Add foreign key relationship between routine_exercises and exercises
-- This migration ensures all exercise_id values are valid UUIDs and adds the missing constraint.

-- 1. Add temporary UUID column
ALTER TABLE routine_exercises ADD COLUMN IF NOT EXISTS exercise_uuid UUID;

-- 2. Try to populate it from existing TEXT exercise_id if it's a valid UUID
UPDATE routine_exercises 
SET exercise_uuid = exercise_id::UUID 
WHERE exercise_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 3. For legacy IDs or names, try to match by name in the exercises table
UPDATE routine_exercises re
SET exercise_uuid = e.id
FROM exercises e
WHERE re.exercise_uuid IS NULL
AND (re.exercise_id = e.name OR re.exercise_id = e.id::text);

-- 4. Delete rows that couldn't be mapped to a valid exercise (to prevent FK violation)
DELETE FROM routine_exercises WHERE exercise_uuid IS NULL;

-- 5. Finalize schema changes
ALTER TABLE routine_exercises DROP COLUMN exercise_id;
ALTER TABLE routine_exercises RENAME COLUMN exercise_uuid TO exercise_id;
ALTER TABLE routine_exercises ALTER COLUMN exercise_id SET NOT NULL;

-- 6. Add the foreign key constraint
-- This is what PostgREST (Supabase) needs to perform the join query
ALTER TABLE routine_exercises 
ADD CONSTRAINT routine_exercises_exercise_id_fkey 
FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);
