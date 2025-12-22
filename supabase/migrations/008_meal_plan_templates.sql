-- Add template support to meal_plans
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6);

-- Update unique constraint
-- We want (user_id, date) to be unique for specific plans
-- And (user_id, day_of_week) to be unique for templates
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_date_key;
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_id_date_key UNIQUE (user_id, date);

-- Add conditional unique constraint for templates
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_user_day_template 
ON meal_plans (user_id, day_of_week) 
WHERE (is_template = true);

-- Add comment
COMMENT ON COLUMN meal_plans.is_template IS 'If true, this plan serves as a recurring template for the specified day_of_week';
COMMENT ON COLUMN meal_plans.day_of_week IS '0-6 representing Sunday to Saturday, used when is_template is true';
