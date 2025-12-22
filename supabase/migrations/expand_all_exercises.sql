-- Comprehensive Exercise Database Expansion
-- Adds 100+ exercises for all muscle groups
-- Run this in Supabase SQL Editor after expand_leg_exercises.sql

-- ============================================
-- PECHO / CHEST (20+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Press variaciones
('Press de Banca con Agarre Cerrado', 'Strength', 'Chest', 'Barbell'),
('Close Grip Bench Press', 'Strength', 'Chest', 'Barbell'),
('Press de Banca con Pausa', 'Strength', 'Chest', 'Barbell'),
('Pause Bench Press', 'Strength', 'Chest', 'Barbell'),
('Press con Mancuernas en Banco Plano', 'Strength', 'Chest', 'Dumbbells'),
('Flat Dumbbell Press', 'Strength', 'Chest', 'Dumbbells'),
('Press con Mancuernas Declinado', 'Strength', 'Chest', 'Dumbbells'),
('Decline Dumbbell Press', 'Strength', 'Chest', 'Dumbbells'),
('Press en Máquina Hammer', 'Strength', 'Chest', 'Machine'),
('Hammer Strength Press', 'Strength', 'Chest', 'Machine'),

-- Aperturas y cruces
('Aperturas Inclinadas', 'Strength', 'Chest', 'Dumbbells'),
('Incline Dumbbell Flyes', 'Strength', 'Chest', 'Dumbbells'),
('Aperturas Declinadas', 'Strength', 'Chest', 'Dumbbells'),
('Decline Dumbbell Flyes', 'Strength', 'Chest', 'Dumbbells'),
('Cruce de Poleas Alto', 'Strength', 'Chest', 'Cable Machine'),
('High Cable Crossover', 'Strength', 'Chest', 'Cable Machine'),
('Cruce de Poleas Bajo', 'Strength', 'Chest', 'Cable Machine'),
('Low Cable Crossover', 'Strength', 'Chest', 'Cable Machine'),
('Cruce de Poleas Medio', 'Strength', 'Chest', 'Cable Machine'),
('Mid Cable Crossover', 'Strength', 'Chest', 'Cable Machine'),

-- Fondos variaciones
('Fondos en Paralelas', 'Strength', 'Chest', 'Bodyweight'),
('Parallel Bar Dips', 'Strength', 'Chest', 'Bodyweight'),
('Fondos Lastrados', 'Strength', 'Chest', 'Bodyweight'),
('Weighted Dips', 'Strength', 'Chest', 'Bodyweight'),

-- Flexiones variaciones
('Flexiones con Palmada', 'Strength', 'Chest', 'Bodyweight'),
('Clap Push-ups', 'Strength', 'Chest', 'Bodyweight'),
('Flexiones Declinadas', 'Strength', 'Chest', 'Bodyweight'),
('Decline Push-ups', 'Strength', 'Chest', 'Bodyweight'),
('Flexiones Diamante', 'Strength', 'Chest', 'Bodyweight'),
('Diamond Push-ups', 'Strength', 'Chest', 'Bodyweight'),
('Flexiones Arquero', 'Strength', 'Chest', 'Bodyweight'),
('Archer Push-ups', 'Strength', 'Chest', 'Bodyweight'),
('Flexiones con Pies Elevados', 'Strength', 'Chest', 'Bodyweight'),
('Feet Elevated Push-ups', 'Strength', 'Chest', 'Bodyweight'),

-- Otros
('Pullover con Barra', 'Strength', 'Chest', 'Barbell'),
('Barbell Pullover', 'Strength', 'Chest', 'Barbell'),
('Pec Deck', 'Strength', 'Chest', 'Machine'),
('Chest Fly Machine', 'Strength', 'Chest', 'Machine')
ON CONFLICT DO NOTHING;

-- ============================================
-- ESPALDA / BACK (25+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Dominadas variaciones
('Dominadas con Agarre Amplio', 'Strength', 'Back', 'Bodyweight'),
('Wide Grip Pull-ups', 'Strength', 'Back', 'Bodyweight'),
('Dominadas con Agarre Cerrado', 'Strength', 'Back', 'Bodyweight'),
('Close Grip Pull-ups', 'Strength', 'Back', 'Bodyweight'),
('Dominadas Supinas', 'Strength', 'Back', 'Bodyweight'),
('Chin-ups', 'Strength', 'Back', 'Bodyweight'),
('Dominadas Neutras', 'Strength', 'Back', 'Bodyweight'),
('Neutral Grip Pull-ups', 'Strength', 'Back', 'Bodyweight'),
('Dominadas Australianas', 'Strength', 'Back', 'Bodyweight'),
('Australian Pull-ups', 'Strength', 'Back', 'Bodyweight'),

-- Remos variaciones
('Remo Pendlay', 'Strength', 'Back', 'Barbell'),
('Pendlay Row', 'Strength', 'Back', 'Barbell'),
('Remo con Barra T', 'Strength', 'Back', 'Barbell'),
('T-Bar Row', 'Strength', 'Back', 'Barbell'),
('Remo con Mancuerna a Una Mano', 'Strength', 'Back', 'Dumbbells'),
('Single Arm Dumbbell Row', 'Strength', 'Back', 'Dumbbells'),
('Remo Sentado en Polea', 'Strength', 'Back', 'Cable Machine'),
('Seated Cable Row', 'Strength', 'Back', 'Cable Machine'),
('Remo en Polea Agarre Cerrado', 'Strength', 'Back', 'Cable Machine'),
('Close Grip Cable Row', 'Strength', 'Back', 'Cable Machine'),
('Remo en Polea Agarre Amplio', 'Strength', 'Back', 'Cable Machine'),
('Wide Grip Cable Row', 'Strength', 'Back', 'Cable Machine'),
('Remo Invertido', 'Strength', 'Back', 'Bodyweight'),
('Inverted Row', 'Strength', 'Back', 'Bodyweight'),
('Remo Seal', 'Strength', 'Back', 'Barbell'),
('Seal Row', 'Strength', 'Back', 'Barbell'),

-- Jalones variaciones
('Jalón con Agarre Amplio', 'Strength', 'Back', 'Cable Machine'),
('Wide Grip Lat Pulldown', 'Strength', 'Back', 'Cable Machine'),
('Jalón Supino', 'Strength', 'Back', 'Cable Machine'),
('Underhand Lat Pulldown', 'Strength', 'Back', 'Cable Machine'),
('Jalón a la Nuca', 'Strength', 'Back', 'Cable Machine'),
('Behind the Neck Pulldown', 'Strength', 'Back', 'Cable Machine'),
('Jalón con Cuerda', 'Strength', 'Back', 'Cable Machine'),
('Rope Pulldown', 'Strength', 'Back', 'Cable Machine'),

-- Otros espalda
('Pullover con Polea Alta', 'Strength', 'Back', 'Cable Machine'),
('Cable Pullover', 'Strength', 'Back', 'Cable Machine'),
('Hiperextensiones', 'Strength', 'Back', 'Bodyweight'),
('Back Extensions', 'Strength', 'Back', 'Bodyweight'),
('Hiperextensiones Lastradas', 'Strength', 'Back', 'Bodyweight'),
('Weighted Back Extensions', 'Strength', 'Back', 'Bodyweight'),
('Superman', 'Strength', 'Back', 'Bodyweight'),
('Remo Meadows', 'Strength', 'Back', 'Barbell'),
('Meadows Row', 'Strength', 'Back', 'Barbell')
ON CONFLICT DO NOTHING;

-- ============================================
-- HOMBROS / SHOULDERS (20+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Press variaciones
('Press con Mancuernas Sentado', 'Strength', 'Shoulders', 'Dumbbells'),
('Seated Dumbbell Press', 'Strength', 'Shoulders', 'Dumbbells'),
('Press con Mancuernas de Pie', 'Strength', 'Shoulders', 'Dumbbells'),
('Standing Dumbbell Press', 'Strength', 'Shoulders', 'Dumbbells'),
('Press Militar Sentado', 'Strength', 'Shoulders', 'Barbell'),
('Seated Military Press', 'Strength', 'Shoulders', 'Barbell'),
('Press Bradford', 'Strength', 'Shoulders', 'Barbell'),
('Bradford Press', 'Strength', 'Shoulders', 'Barbell'),
('Press en Máquina Sentado', 'Strength', 'Shoulders', 'Machine'),
('Seated Machine Press', 'Strength', 'Shoulders', 'Machine'),

-- Elevaciones laterales variaciones
('Elevaciones Laterales en Polea', 'Strength', 'Shoulders', 'Cable Machine'),
('Cable Lateral Raises', 'Strength', 'Shoulders', 'Cable Machine'),
('Elevaciones Laterales Inclinado', 'Strength', 'Shoulders', 'Dumbbells'),
('Incline Lateral Raises', 'Strength', 'Shoulders', 'Dumbbells'),
('Elevaciones Laterales con Disco', 'Strength', 'Shoulders', 'Weight Plate'),
('Plate Lateral Raises', 'Strength', 'Shoulders', 'Weight Plate'),

-- Posterior deltoides
('Pájaros en Banco Inclinado', 'Strength', 'Shoulders', 'Dumbbells'),
('Incline Rear Delt Flyes', 'Strength', 'Shoulders', 'Dumbbells'),
('Pájaros en Máquina Pec Deck', 'Strength', 'Shoulders', 'Machine'),
('Reverse Pec Deck', 'Strength', 'Shoulders', 'Machine'),
('Face Pull con Cuerda', 'Strength', 'Shoulders', 'Cable Machine'),
('Rope Face Pull', 'Strength', 'Shoulders', 'Cable Machine'),
('Face Pull con Banda', 'Strength', 'Shoulders', 'Resistance Band'),
('Band Face Pull', 'Strength', 'Shoulders', 'Resistance Band'),

-- Elevaciones frontales
('Elevaciones Frontales con Barra', 'Strength', 'Shoulders', 'Barbell'),
('Barbell Front Raises', 'Strength', 'Shoulders', 'Barbell'),
('Elevaciones Frontales con Disco', 'Strength', 'Shoulders', 'Weight Plate'),
('Plate Front Raises', 'Strength', 'Shoulders', 'Weight Plate'),
('Elevaciones Frontales Alternas', 'Strength', 'Shoulders', 'Dumbbells'),
('Alternating Front Raises', 'Strength', 'Shoulders', 'Dumbbells'),

-- Otros
('Remo al Mentón con Mancuernas', 'Strength', 'Shoulders', 'Dumbbells'),
('Dumbbell Upright Row', 'Strength', 'Shoulders', 'Dumbbells'),
('Remo al Mentón con Polea', 'Strength', 'Shoulders', 'Cable Machine'),
('Cable Upright Row', 'Strength', 'Shoulders', 'Cable Machine'),
('Press Cubano', 'Strength', 'Shoulders', 'Dumbbells'),
('Cuban Press', 'Strength', 'Shoulders', 'Dumbbells'),
('Y-T-W Raises', 'Strength', 'Shoulders', 'Dumbbells')
ON CONFLICT DO NOTHING;

-- ============================================
-- BRAZOS / ARMS (30+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Bíceps variaciones
('Curl con Barra Z', 'Strength', 'Arms', 'EZ-Bar'),
('EZ-Bar Curl', 'Strength', 'Arms', 'EZ-Bar'),
('Curl 21s', 'Strength', 'Arms', 'Barbell'),
('21s Curls', 'Strength', 'Arms', 'Barbell'),
('Curl Araña', 'Strength', 'Arms', 'Dumbbells'),
('Spider Curls', 'Strength', 'Arms', 'Dumbbells'),
('Curl Inclinado', 'Strength', 'Arms', 'Dumbbells'),
('Incline Dumbbell Curl', 'Strength', 'Arms', 'Dumbbells'),
('Curl Zottman', 'Strength', 'Arms', 'Dumbbells'),
('Zottman Curl', 'Strength', 'Arms', 'Dumbbells'),
('Curl Inverso', 'Strength', 'Arms', 'Barbell'),
('Reverse Curl', 'Strength', 'Arms', 'Barbell'),
('Curl con Polea Baja', 'Strength', 'Arms', 'Cable Machine'),
('Low Cable Curl', 'Strength', 'Arms', 'Cable Machine'),
('Curl con Polea Alta', 'Strength', 'Arms', 'Cable Machine'),
('High Cable Curl', 'Strength', 'Arms', 'Cable Machine'),
('Curl Cruzado', 'Strength', 'Arms', 'Cable Machine'),
('Cross Body Curl', 'Strength', 'Arms', 'Dumbbells'),
('Curl con Banda', 'Strength', 'Arms', 'Resistance Band'),
('Band Curl', 'Strength', 'Arms', 'Resistance Band'),

-- Tríceps variaciones
('Press Francés con Mancuernas', 'Strength', 'Arms', 'Dumbbells'),
('Dumbbell Skull Crushers', 'Strength', 'Arms', 'Dumbbells'),
('Extensión de Tríceps Sentado', 'Strength', 'Arms', 'Dumbbells'),
('Seated Overhead Extension', 'Strength', 'Arms', 'Dumbbells'),
('Extensión de Tríceps Acostado', 'Strength', 'Arms', 'Dumbbells'),
('Lying Tricep Extension', 'Strength', 'Arms', 'Dumbbells'),
('Patada de Tríceps a Dos Manos', 'Strength', 'Arms', 'Dumbbells'),
('Two Arm Kickback', 'Strength', 'Arms', 'Dumbbells'),
('Fondos entre Bancos', 'Strength', 'Arms', 'Bodyweight'),
('Bench Dips', 'Strength', 'Arms', 'Bodyweight'),
('Pushdown con Cuerda', 'Strength', 'Arms', 'Cable Machine'),
('Rope Pushdown', 'Strength', 'Arms', 'Cable Machine'),
('Pushdown con Barra V', 'Strength', 'Arms', 'Cable Machine'),
('V-Bar Pushdown', 'Strength', 'Arms', 'Cable Machine'),
('Pushdown Invertido', 'Strength', 'Arms', 'Cable Machine'),
('Reverse Grip Pushdown', 'Strength', 'Arms', 'Cable Machine'),
('Extensión sobre Cabeza en Polea', 'Strength', 'Arms', 'Cable Machine'),
('Cable Overhead Extension', 'Strength', 'Arms', 'Cable Machine'),
('Diamond Push-ups', 'Strength', 'Arms', 'Bodyweight'),
('JM Press', 'Strength', 'Arms', 'Barbell'),

-- Antebrazos
('Curl de Muñeca', 'Strength', 'Arms', 'Barbell'),
('Wrist Curl', 'Strength', 'Arms', 'Barbell'),
('Curl de Muñeca Inverso', 'Strength', 'Arms', 'Barbell'),
('Reverse Wrist Curl', 'Strength', 'Arms', 'Barbell'),
('Agarre con Pinza', 'Strength', 'Arms', 'Weight Plate'),
('Plate Pinch', 'Strength', 'Arms', 'Weight Plate'),
('Farmers Walk', 'Strength', 'Arms', 'Dumbbells')
ON CONFLICT DO NOTHING;

-- ============================================
-- CORE / ABDOMINALES (20+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- Planchas variaciones
('Plancha con Elevación de Pierna', 'Strength', 'Core', 'Bodyweight'),
('Plank Leg Raises', 'Strength', 'Core', 'Bodyweight'),
('Plancha con Toque de Hombro', 'Strength', 'Core', 'Bodyweight'),
('Plank Shoulder Taps', 'Strength', 'Core', 'Bodyweight'),
('Plancha Comando', 'Strength', 'Core', 'Bodyweight'),
('Commando Plank', 'Strength', 'Core', 'Bodyweight'),
('RKC Plank', 'Strength', 'Core', 'Bodyweight'),

-- Abdominales variaciones
('Crunches en Polea', 'Strength', 'Core', 'Cable Machine'),
('Cable Crunches', 'Strength', 'Core', 'Cable Machine'),
('Crunches en Máquina', 'Strength', 'Core', 'Machine'),
('Ab Machine Crunches', 'Strength', 'Core', 'Machine'),
('Crunches con Disco', 'Strength', 'Core', 'Weight Plate'),
('Weighted Crunches', 'Strength', 'Core', 'Weight Plate'),
('Bicicleta', 'Strength', 'Core', 'Bodyweight'),
('Bicycle Crunches', 'Strength', 'Core', 'Bodyweight'),
('V-Ups', 'Strength', 'Core', 'Bodyweight'),

-- Elevación de piernas
('Elevación de Piernas Colgado', 'Strength', 'Core', 'Bodyweight'),
('Hanging Leg Raises', 'Strength', 'Core', 'Bodyweight'),
('Elevación de Rodillas Colgado', 'Strength', 'Core', 'Bodyweight'),
('Hanging Knee Raises', 'Strength', 'Core', 'Bodyweight'),
('L-Sit', 'Strength', 'Core', 'Bodyweight'),
('Elevación de Piernas en Banco', 'Strength', 'Core', 'Bodyweight'),
('Bench Leg Raises', 'Strength', 'Core', 'Bodyweight'),

-- Russian Twist variaciones
('Russian Twist con Peso', 'Strength', 'Core', 'Weight Plate'),
('Weighted Russian Twist', 'Strength', 'Core', 'Weight Plate'),

-- Otros core
('Dead Bug', 'Strength', 'Core', 'Bodyweight'),
('Bird Dog', 'Strength', 'Core', 'Bodyweight'),
('Hollow Body Hold', 'Strength', 'Core', 'Bodyweight'),
('Ab Wheel Rollout', 'Strength', 'Core', 'Ab Wheel'),
('Rueda Abdominal', 'Strength', 'Core', 'Ab Wheel'),
('Pallof Press', 'Strength', 'Core', 'Cable Machine'),
('Wood Chop', 'Strength', 'Core', 'Cable Machine'),
('Leñador', 'Strength', 'Core', 'Cable Machine'),
('Suitcase Carry', 'Strength', 'Core', 'Dumbbell'),
('Caminata con Maleta', 'Strength', 'Core', 'Dumbbell')
ON CONFLICT DO NOTHING;

-- ============================================
-- CARDIO (15+ new exercises)
-- ============================================
INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
-- HIIT
('Burpees con Flexión', 'Cardio', 'Cardio', 'Bodyweight'),
('Burpee Push-up', 'Cardio', 'Cardio', 'Bodyweight'),
('Burpees con Salto a Cajón', 'Cardio', 'Cardio', 'Bodyweight'),
('Burpee Box Jump', 'Cardio', 'Cardio', 'Bodyweight'),
('Sprints', 'Cardio', 'Cardio', 'Bodyweight'),
('Battle Ropes', 'Cardio', 'Cardio', 'Battle Rope'),
('Cuerdas de Batalla', 'Cardio', 'Cardio', 'Battle Rope'),

-- Saltos
('Saltos al Cajón', 'Cardio', 'Cardio', 'Bodyweight'),
('Box Jumps', 'Cardio', 'Cardio', 'Bodyweight'),
('Saltos Laterales', 'Cardio', 'Cardio', 'Bodyweight'),
('Lateral Jumps', 'Cardio', 'Cardio', 'Bodyweight'),
('Tuck Jumps', 'Cardio', 'Cardio', 'Bodyweight'),
('Saltos con Rodillas al Pecho', 'Cardio', 'Cardio', 'Bodyweight'),

-- Máquinas
('Elíptica', 'Cardio', 'Cardio', 'Machine'),
('Elliptical', 'Cardio', 'Cardio', 'Machine'),
('StairMaster', 'Cardio', 'Cardio', 'Machine'),
('Escaladora', 'Cardio', 'Cardio', 'Machine'),
('Assault Bike', 'Cardio', 'Cardio', 'Machine'),
('Bicicleta de Asalto', 'Cardio', 'Cardio', 'Machine'),
('Remo Ergómetro', 'Cardio', 'Cardio', 'Machine'),
('Rowing Machine', 'Cardio', 'Cardio', 'Machine'),

-- Otros
('Skipping', 'Cardio', 'Cardio', 'Bodyweight'),
('Shadow Boxing', 'Cardio', 'Cardio', 'Bodyweight'),
('Boxeo de Sombra', 'Cardio', 'Cardio', 'Bodyweight')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify total count
-- ============================================
SELECT muscle_group, COUNT(*) as count
FROM exercises 
WHERE user_id IS NULL
GROUP BY muscle_group
ORDER BY muscle_group;
