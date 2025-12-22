-- Sync exercise names between frontend (Spanish) and database (English/Spanish)
-- This ensures that mapping by name works correctly.

-- 1. Pecho
UPDATE exercises SET name = 'Press de Banca (Barra)' WHERE name = 'Barbell Bench Press' OR name = 'Bench Press';
UPDATE exercises SET name = 'Press Inclinado (Mancuernas)' WHERE name = 'Incline Dumbbell Press';
UPDATE exercises SET name = 'Aperturas (Máquina)' WHERE name = 'Pec Deck' OR name = 'Chest Fly Machine';
UPDATE exercises SET name = 'Fondos (Dips)' WHERE name = 'Dips' OR name = 'Chest Dips';
UPDATE exercises SET name = 'Cruce de Poleas' WHERE name = 'Cable Flyes';

-- 2. Espalda
UPDATE exercises SET name = 'Dominadas' WHERE name = 'Pull-ups' OR name = 'Pullups';
UPDATE exercises SET name = 'Remo con Barra' WHERE name = 'Barbell Rows' OR name = 'Bent Over Barbell Row';
UPDATE exercises SET name = 'Jalón al Pecho' WHERE name = 'Lat Pulldown';
UPDATE exercises SET name = 'Remo Gironda' WHERE name = 'Cable Rows' OR name = 'Seated Cable Row';
UPDATE exercises SET name = 'Peso Muerto' WHERE name = 'Deadlift';
UPDATE exercises SET name = 'Remo con Mancuerna' WHERE name = 'Dumbbell Rows' OR name = 'Single Arm Dumbbell Row';

-- 3. Piernas
UPDATE exercises SET name = 'Sentadilla (Barra)' WHERE name = 'Barbell Squat' OR name = 'Squats';
UPDATE exercises SET name = 'Prensa de Piernas' WHERE name = 'Leg Press';
UPDATE exercises SET name = 'Extensiones de Cuádriceps' WHERE name = 'Leg Extension';
UPDATE exercises SET name = 'Curl Femoral Tumbado' WHERE name = 'Leg Curl' OR name = 'Lying Leg Curl';
UPDATE exercises SET name = 'Zancadas (Mancuernas)' WHERE name = 'Dumbbell Lunges' OR name = 'Lunges';
UPDATE exercises SET name = 'Elevación de Gemelos' WHERE name = 'Calf Raises';

-- 4. Hombros
UPDATE exercises SET name = 'Press Militar (Barra)' WHERE name = 'Overhead Press' OR name = 'Military Press';
UPDATE exercises SET name = 'Elevaciones Laterales' WHERE name = 'Lateral Raises';
UPDATE exercises SET name = 'Pájaros (Posterior)' WHERE name = 'Bent Over Lateral Raises' OR name = 'Rear Delt Flyes';
UPDATE exercises SET name = 'Face Pull' WHERE name = 'Face Pulls';

-- 5. Brazos
UPDATE exercises SET name = 'Curl de Bíceps (Barra)' WHERE name = 'Barbell Curls';
UPDATE exercises SET name = 'Curl Martillo' WHERE name = 'Hammer Curls';
UPDATE exercises SET name = 'Extensiones de Tríceps (Polea)' WHERE name = 'Tricep Pushdown';
UPDATE exercises SET name = 'Press Francés' WHERE name = 'Skull Crushers';

-- 6. Core
UPDATE exercises SET name = 'Plancha Abdominal' WHERE name = 'Plank';
UPDATE exercises SET name = 'Crunch Abdominal' WHERE name = 'Crunches';
UPDATE exercises SET name = 'Russian Twist' WHERE name = 'Russian Twists';

-- 7. Cardio
UPDATE exercises SET name = 'Burpees' WHERE name = 'Burpees';
UPDATE exercises SET name = 'Saltos de Cuerda' WHERE name = 'Jump Rope';

-- Add Spanish names if they don't exist at all
INSERT INTO exercises (name, category, muscle_group, equipment)
SELECT 'Press de Banca (Barra)', 'Strength', 'Chest', 'Barbell'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press de Banca (Barra)');

INSERT INTO exercises (name, category, muscle_group, equipment)
SELECT 'Sentadilla (Barra)', 'Strength', 'Legs', 'Barbell'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Sentadilla (Barra)');

-- Add more as needed...
