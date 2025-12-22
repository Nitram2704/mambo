-- Fix 42P10: Restore unique constraints for meal_plans upsert
-- PostgREST upsert requires a physical unique constraint matching the columns.

-- 1. Make date nullable (templates don't strictly need a date if they have day_of_week)
ALTER TABLE meal_plans ALTER COLUMN date DROP NOT NULL;

-- 2. Drop the indexes we created in 011 (we'll replace them with constraints)
DROP INDEX IF EXISTS idx_meal_plans_regular_unique;
DROP INDEX IF EXISTS idx_meal_plans_template_unique;

-- 3. Add back the unique constraints
-- For regular plans: unique (user_id, date)
-- For templates: unique (user_id, day_of_week)
-- Note: Postgres allows multiple rows with NULL in a unique constraint, 
-- so (user_id, date) won't conflict for templates (where date will be NULL),
-- and (user_id, day_of_week) won't conflict for regular plans (where day_of_week is NULL).

ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_date_unique UNIQUE (user_id, date);
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_day_unique UNIQUE (user_id, day_of_week);

-- 4. Clean up any existing templates that might have dummy dates causing conflicts
-- (Optional but safe)
UPDATE meal_plans SET date = NULL WHERE is_template = true;
