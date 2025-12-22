-- Fix Romanian Deadlift category and add missing leg exercises
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX: Peso Muerto Rumano should be Legs, not Back
-- ============================================
UPDATE exercises 
SET muscle_group = 'Legs' 
WHERE name IN ('Peso Muerto Rumano', 'Romanian Deadlift')
AND user_id IS NULL;

-- ============================================
-- ADD: Missing plural variant for Extensiones de Cuádriceps
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
('Extensiones de Cuádriceps', 'Strength', 'Legs', 'Machine')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADD: Comprehensive Leg Exercises (Missing from database)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Aductores (MISSING - this is why it's not being found!)
('Aductores', 'Strength', 'Legs', 'Machine'),
('Aductores en Máquina', 'Strength', 'Legs', 'Machine'),
('Aducción de Cadera', 'Strength', 'Legs', 'Machine'),
('Hip Adduction', 'Strength', 'Legs', 'Machine'),

-- Abductores
('Abductores', 'Strength', 'Legs', 'Machine'),
('Abductores en Máquina', 'Strength', 'Legs', 'Machine'),
('Abducción de Cadera', 'Strength', 'Legs', 'Machine'),
('Hip Abduction', 'Strength', 'Legs', 'Machine'),

-- Glúteos específicos
('Patada de Glúteo', 'Strength', 'Legs', 'Cable Machine'),
('Patada de Glúteo en Polea', 'Strength', 'Legs', 'Cable Machine'),
('Cable Kickbacks', 'Strength', 'Legs', 'Cable Machine'),
('Glute Kickbacks', 'Strength', 'Legs', 'Cable Machine'),
('Puente de Glúteos', 'Strength', 'Legs', 'Bodyweight'),
('Glute Bridge', 'Strength', 'Legs', 'Bodyweight'),
('Elevación de Cadera', 'Strength', 'Legs', 'Bodyweight'),

-- Split Squats y variaciones
('Sentadilla Búlgara', 'Strength', 'Legs', 'Dumbbells'),
('Bulgarian Split Squat', 'Strength', 'Legs', 'Dumbbells'),
('Zancadas Búlgaras', 'Strength', 'Legs', 'Dumbbells'),
('Split Squat', 'Strength', 'Legs', 'Dumbbells'),

-- Peso Muerto variaciones (para pierna, no espalda)
('Peso Muerto Sumo', 'Strength', 'Legs', 'Barbell'),
('Sumo Deadlift', 'Strength', 'Legs', 'Barbell'),
('Peso Muerto con Trap Bar', 'Strength', 'Legs', 'Trap Bar'),
('Trap Bar Deadlift', 'Strength', 'Legs', 'Trap Bar'),

-- Cuádriceps específicos
('Sentadilla Sissy', 'Strength', 'Legs', 'Bodyweight'),
('Sissy Squat', 'Strength', 'Legs', 'Bodyweight'),
('Sentadilla en Máquina Smith', 'Strength', 'Legs', 'Smith Machine'),
('Smith Machine Squat', 'Strength', 'Legs', 'Smith Machine'),

-- Isquiotibiales específicos
('Curl Femoral Tumbado', 'Strength', 'Legs', 'Machine'),
('Lying Leg Curl', 'Strength', 'Legs', 'Machine'),
('Curl Nórdico', 'Strength', 'Legs', 'Bodyweight'),
('Nordic Curls', 'Strength', 'Legs', 'Bodyweight'),
('Buenos Días', 'Strength', 'Legs', 'Barbell'),

-- Gemelos variaciones
('Elevación de Gemelos de Pie', 'Strength', 'Legs', 'Machine'),
('Standing Calf Raise', 'Strength', 'Legs', 'Machine'),
('Elevación de Gemelos en Prensa', 'Strength', 'Legs', 'Machine'),
('Calf Press', 'Strength', 'Legs', 'Machine'),
('Gemelos Burro', 'Strength', 'Legs', 'Machine'),
('Donkey Calf Raise', 'Strength', 'Legs', 'Machine'),

-- Otros ejercicios de pierna
('Zancadas Inversas', 'Strength', 'Legs', 'Dumbbells'),
('Reverse Lunges', 'Strength', 'Legs', 'Dumbbells'),
('Zancadas Laterales', 'Strength', 'Legs', 'Dumbbells'),
('Lateral Lunges', 'Strength', 'Legs', 'Dumbbells'),
('Step Down', 'Strength', 'Legs', 'Bodyweight'),
('Sentadilla Pistola', 'Strength', 'Legs', 'Bodyweight'),
('Pistol Squat', 'Strength', 'Legs', 'Bodyweight'),
('Box Squat', 'Strength', 'Legs', 'Barbell'),
('Sentadilla en Cajón', 'Strength', 'Legs', 'Barbell')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify the changes
-- ============================================
SELECT name, muscle_group, equipment 
FROM exercises 
WHERE name ILIKE '%peso muerto rumano%' 
AND user_id IS NULL;

SELECT COUNT(*) as leg_exercises 
FROM exercises 
WHERE muscle_group = 'Legs' 
AND user_id IS NULL;

SELECT name FROM exercises 
WHERE name ILIKE '%aductor%' 
AND user_id IS NULL;
