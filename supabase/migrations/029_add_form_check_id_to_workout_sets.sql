-- Add form_check_id to workout_sets table
ALTER TABLE workout_sets ADD COLUMN form_check_id UUID REFERENCES form_checks(id) ON DELETE SET NULL;