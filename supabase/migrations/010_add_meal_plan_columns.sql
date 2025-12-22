-- Add missing columns to meal_plans table
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS day_of_week INTEGER;

-- Drop existing unique constraint
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_date_key;

-- Add new unique constraints
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_date_unique 
    EXCLUDE (user_id WITH =, date WITH =) 
    WHERE (is_template = false);

ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_day_unique 
    EXCLUDE (user_id WITH =, day_of_week WITH =) 
    WHERE (is_template = true);