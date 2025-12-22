-- Comprehensive Exercise Library (Spanish & English)
-- Run this in Supabase SQL Editor

-- First, delete existing global exercises to avoid duplicates
DELETE FROM exercises WHERE user_id IS NULL;

-- ============================================
-- PECHO / CHEST
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish names (primary)
('Press de Banca', 'Strength', 'Chest', 'Barbell'),
('Press de Banca con Mancuernas', 'Strength', 'Chest', 'Dumbbells'),
('Press Inclinado', 'Strength', 'Chest', 'Barbell'),
('Press Inclinado con Mancuernas', 'Strength', 'Chest', 'Dumbbells'),
('Press de Banca Inclinado', 'Strength', 'Chest', 'Barbell'),
('Press Declinado', 'Strength', 'Chest', 'Barbell'),
('Aperturas con Mancuernas', 'Strength', 'Chest', 'Dumbbells'),
('Aperturas en Polea', 'Strength', 'Chest', 'Cable Machine'),
('Flexiones', 'Strength', 'Chest', 'Bodyweight'),
('Pullover', 'Strength', 'Chest', 'Dumbbells'),
('Fondos', 'Strength', 'Chest', 'Bodyweight'),
('Dips', 'Strength', 'Chest', 'Bodyweight'),
('Fondos en Banco', 'Strength', 'Chest', 'Bodyweight'),
('Push-ups', 'Strength', 'Chest', 'Bodyweight'),
-- English names
('Bench Press', 'Strength', 'Chest', 'Barbell'),
('Dumbbell Bench Press', 'Strength', 'Chest', 'Dumbbells'),
('Incline Bench Press', 'Strength', 'Chest', 'Barbell'),
('Decline Bench Press', 'Strength', 'Chest', 'Barbell'),
('Dumbbell Flyes', 'Strength', 'Chest', 'Dumbbells'),
('Cable Flyes', 'Strength', 'Chest', 'Cable Machine')
ON CONFLICT DO NOTHING;

-- ============================================
-- ESPALDA / BACK
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish names
('Dominadas', 'Strength', 'Back', 'Bodyweight'),
('Dominadas Lastradas', 'Strength', 'Back', 'Bodyweight'),
('Jalón al Pecho', 'Strength', 'Back', 'Cable Machine'),
('Jalón al Pecho Agarre Cerrado', 'Strength', 'Back', 'Cable Machine'),
('Remo con Barra', 'Strength', 'Back', 'Barbell'),
('Remo con Mancuerna', 'Strength', 'Back', 'Dumbbells'),
('Remo en Máquina', 'Strength', 'Back', 'Machine'),
('Peso Muerto', 'Strength', 'Back', 'Barbell'),
('Peso Muerto Rumano', 'Strength', 'Back', 'Barbell'),
('Peso Muerto con Déficit', 'Strength', 'Back', 'Barbell'),
('Face Pull', 'Strength', 'Back', 'Cable Machine'),
('Encogimientos', 'Strength', 'Back', 'Dumbbells'),
('Good Morning', 'Strength', 'Back', 'Barbell'),
-- English names
('Pull-ups', 'Strength', 'Back', 'Bodyweight'),
('Weighted Pull-ups', 'Strength', 'Back', 'Bodyweight'),
('Lat Pulldown', 'Strength', 'Back', 'Cable Machine'),
('Barbell Row', 'Strength', 'Back', 'Barbell'),
('Dumbbell Row', 'Strength', 'Back', 'Dumbbells'),
('Deadlift', 'Strength', 'Back', 'Barbell'),
('Romanian Deadlift', 'Strength', 'Back', 'Barbell'),
('Face Pulls', 'Strength', 'Back', 'Cable Machine'),
('Shrugs', 'Strength', 'Back', 'Dumbbells')
ON CONFLICT DO NOTHING;

-- ============================================
-- PIERNAS / LEGS
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish names
('Sentadilla con Barra', 'Strength', 'Legs', 'Barbell'),
('Sentadilla Goblet', 'Strength', 'Legs', 'Dumbbells'),
('Sentadilla Frontal', 'Strength', 'Legs', 'Barbell'),
('Sentadilla con Pausa', 'Strength', 'Legs', 'Barbell'),
('Sentadillas', 'Strength', 'Legs', 'Bodyweight'),
('Sentadilla con Salto', 'Strength', 'Legs', 'Bodyweight'),
('Prensa de Piernas', 'Strength', 'Legs', 'Machine'),
('Extensión de Cuádriceps', 'Strength', 'Legs', 'Machine'),
('Curl Femoral', 'Strength', 'Legs', 'Machine'),
('Curl Femoral Sentado', 'Strength', 'Legs', 'Machine'),
('Zancadas', 'Strength', 'Legs', 'Bodyweight'),
('Zancadas con Mancuernas', 'Strength', 'Legs', 'Dumbbells'),
('Zancadas Caminando', 'Strength', 'Legs', 'Dumbbells'),
('Hip Thrust', 'Strength', 'Legs', 'Barbell'),
('Elevación de Gemelos', 'Strength', 'Legs', 'Machine'),
('Elevación de Gemelos Sentado', 'Strength', 'Legs', 'Machine'),
('Step Ups', 'Strength', 'Legs', 'Dumbbells'),
('Hack Squat', 'Strength', 'Legs', 'Machine'),
-- English names
('Barbell Squat', 'Strength', 'Legs', 'Barbell'),
('Goblet Squat', 'Strength', 'Legs', 'Dumbbells'),
('Front Squat', 'Strength', 'Legs', 'Barbell'),
('Leg Press', 'Strength', 'Legs', 'Machine'),
('Leg Extension', 'Strength', 'Legs', 'Machine'),
('Leg Curl', 'Strength', 'Legs', 'Machine'),
('Lunges', 'Strength', 'Legs', 'Bodyweight'),
('Walking Lunges', 'Strength', 'Legs', 'Dumbbells'),
('Hip Thrusts', 'Strength', 'Legs', 'Barbell'),
('Calf Raise', 'Strength', 'Legs', 'Machine')
ON CONFLICT DO NOTHING;

-- ============================================
-- HOMBROS / SHOULDERS
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish names
('Press Militar', 'Strength', 'Shoulders', 'Barbell'),
('Press Militar con Mancuernas', 'Strength', 'Shoulders', 'Dumbbells'),
('Press de Hombros', 'Strength', 'Shoulders', 'Dumbbells'),
('Press Arnold', 'Strength', 'Shoulders', 'Dumbbells'),
('Elevaciones Laterales', 'Strength', 'Shoulders', 'Dumbbells'),
('Elevaciones Frontales', 'Strength', 'Shoulders', 'Dumbbells'),
('Pájaros', 'Strength', 'Shoulders', 'Dumbbells'),
('Push Press', 'Strength', 'Shoulders', 'Barbell'),
-- English names
('Overhead Press', 'Strength', 'Shoulders', 'Barbell'),
('Dumbbell Shoulder Press', 'Strength', 'Shoulders', 'Dumbbells'),
('Arnold Press', 'Strength', 'Shoulders', 'Dumbbells'),
('Lateral Raises', 'Strength', 'Shoulders', 'Dumbbells'),
('Front Raises', 'Strength', 'Shoulders', 'Dumbbells'),
('Rear Delt Flyes', 'Strength', 'Shoulders', 'Dumbbells')
ON CONFLICT DO NOTHING;

-- ============================================
-- BRAZOS / ARMS
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish - Bíceps
('Curl de Bíceps', 'Strength', 'Arms', 'Dumbbells'),
('Curl de Bíceps con Barra', 'Strength', 'Arms', 'Barbell'),
('Curl con Barra', 'Strength', 'Arms', 'Barbell'),
('Curl con Mancuernas', 'Strength', 'Arms', 'Dumbbells'),
('Curl Martillo', 'Strength', 'Arms', 'Dumbbells'),
('Curl Predicador', 'Strength', 'Arms', 'Dumbbells'),
('Curl en Polea', 'Strength', 'Arms', 'Cable Machine'),
-- Spanish - Tríceps
('Extensión de Tríceps', 'Strength', 'Arms', 'Dumbbells'),
('Extensiones de Tríceps', 'Strength', 'Arms', 'Dumbbells'),
('Extensiones sobre la Cabeza', 'Strength', 'Arms', 'Dumbbells'),
('Pushdown de Tríceps', 'Strength', 'Arms', 'Cable Machine'),
('Press Francés', 'Strength', 'Arms', 'Barbell'),
('Press de Banca Cerrado', 'Strength', 'Arms', 'Barbell'),
-- English
('Bicep Curls', 'Strength', 'Arms', 'Dumbbells'),
('Barbell Curls', 'Strength', 'Arms', 'Barbell'),
('Hammer Curls', 'Strength', 'Arms', 'Dumbbells'),
('Preacher Curls', 'Strength', 'Arms', 'Dumbbells'),
('Cable Curls', 'Strength', 'Arms', 'Cable Machine'),
('Tricep Extension', 'Strength', 'Arms', 'Dumbbells'),
('Tricep Pushdown', 'Strength', 'Arms', 'Cable Machine'),
('Skull Crushers', 'Strength', 'Arms', 'Barbell'),
('Close Grip Bench Press', 'Strength', 'Arms', 'Barbell')
ON CONFLICT DO NOTHING;

-- ============================================
-- CORE / ABDOMINALES
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Spanish
('Plancha', 'Strength', 'Core', 'Bodyweight'),
('Plancha Lateral', 'Strength', 'Core', 'Bodyweight'),
('Abdominales', 'Strength', 'Core', 'Bodyweight'),
('Abdominales en Polea', 'Strength', 'Core', 'Cable Machine'),
('Russian Twist', 'Strength', 'Core', 'Bodyweight'),
-- English
('Plank', 'Strength', 'Core', 'Bodyweight'),
('Side Plank', 'Strength', 'Core', 'Bodyweight'),
('Crunches', 'Strength', 'Core', 'Bodyweight'),
('Cable Crunches', 'Strength', 'Core', 'Cable Machine'),
('Russian Twists', 'Strength', 'Core', 'Bodyweight'),
('Leg Raises', 'Strength', 'Core', 'Bodyweight'),
('Mountain Climbers', 'Cardio', 'Core', 'Bodyweight')
ON CONFLICT DO NOTHING;

-- ============================================
-- CARDIO
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
('Burpees', 'Cardio', 'Cardio', 'Bodyweight'),
('Saltos de Tijera', 'Cardio', 'Cardio', 'Bodyweight'),
('Jumping Jacks', 'Cardio', 'Cardio', 'Bodyweight'),
('High Knees', 'Cardio', 'Cardio', 'Bodyweight'),
('Running', 'Cardio', 'Cardio', 'Bodyweight'),
('Jump Rope', 'Cardio', 'Cardio', 'Jump Rope')
ON CONFLICT DO NOTHING;

-- ============================================
-- Create unique index to prevent duplicates
-- ============================================
DROP INDEX IF EXISTS idx_exercises_name_unique;
CREATE UNIQUE INDEX idx_exercises_name_unique 
ON exercises(LOWER(name)) 
WHERE user_id IS NULL;

-- Verify count
SELECT COUNT(*) as total_exercises FROM exercises WHERE user_id IS NULL;
