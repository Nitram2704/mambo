-- Fix missing columns in meal_plans table
DO $$ 
BEGIN
    -- Add is_template if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meal_plans' AND column_name = 'is_template') THEN
        ALTER TABLE meal_plans ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add day_of_week if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meal_plans' AND column_name = 'day_of_week') THEN
        ALTER TABLE meal_plans ADD COLUMN day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6);
    END IF;
END $$;

-- Update unique constraints
-- 1. Drop old constraint if it exists
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_date_key;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_date_unique;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_day_unique;

-- 2. Add regular plan constraint (user_id, date) when not a template
-- Note: We use a unique index instead of a constraint for conditional uniqueness if needed, 
-- but for now a simple unique on (user_id, date) is fine for regular plans.
-- However, if date is required for templates too (as a dummy), we need to be careful.
-- In the store, templates use a dummy date.

-- Let's use the most robust approach:
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_regular_unique 
ON meal_plans (user_id, date) 
WHERE (is_template = false);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_template_unique 
ON meal_plans (user_id, day_of_week) 
WHERE (is_template = true);

-- Add comments
COMMENT ON COLUMN meal_plans.is_template IS 'If true, this plan serves as a recurring template for the specified day_of_week';
COMMENT ON COLUMN meal_plans.day_of_week IS '0-6 representing Sunday to Saturday, used when is_template is true';
