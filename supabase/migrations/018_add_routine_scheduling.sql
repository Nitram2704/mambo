-- Add scheduling columns to routines table
ALTER TABLE routines 
ADD COLUMN IF NOT EXISTS schedule_type text CHECK (schedule_type IN ('specific_days', 'interval')),
ADD COLUMN IF NOT EXISTS schedule_days integer[], -- Array of integers 0-6 (Sunday-Saturday)
ADD COLUMN IF NOT EXISTS schedule_interval integer, -- Number of days for interval
ADD COLUMN IF NOT EXISTS schedule_start_date date;

-- Add comment for documentation
COMMENT ON COLUMN routines.schedule_type IS 'Type of schedule: specific_days or interval';
COMMENT ON COLUMN routines.schedule_days IS 'Array of days of week (0=Sunday, 6=Saturday) for specific_days type';
COMMENT ON COLUMN routines.schedule_interval IS 'Number of days between workouts for interval type';
COMMENT ON COLUMN routines.schedule_start_date IS 'Start date for interval calculation';
