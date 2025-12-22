-- Migration: Add educational content fields to exercises table
-- This enables rich multimedia educational content for each exercise

-- Add educational content columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS gif_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS tutorial_steps TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS common_mistakes JSONB;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS safety_tips TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscles_diagram_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced'));
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS estimated_duration INTEGER; -- in seconds
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS target_muscles TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment_needed TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN (equipment_needed);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_exercises_updated_at();

-- Insert educational content for 3 basic exercises as seed data
UPDATE exercises SET
    video_url = 'https://www.youtube.com/watch?v=aclHkVaku9U',
    gif_url = 'https://example.com/squat-animation.gif',
    tutorial_steps = ARRAY[
        'Colócate de pie con los pies separados al ancho de hombros',
        'Baja lentamente flexionando las rodillas y caderas',
        'Mantén la espalda recta y el pecho hacia arriba',
        'Desciende hasta que los muslos queden paralelos al suelo',
        'Empuja con los talones para volver a la posición inicial'
    ],
    common_mistakes = '[
        {"title": "Rodillas pasan los dedos", "description": "Las rodillas no deben pasar la línea de los dedos del pie para evitar tensión en las rodillas", "image_url": "https://example.com/squat-knee-error.jpg"},
        {"title": "Espalda redondeada", "description": "Mantén la espalda recta para proteger la columna vertebral", "image_url": "https://example.com/squat-back-error.jpg"},
        {"title": "Talones se levantan", "description": "Mantén los talones firmes en el suelo para distribuir el peso correctamente", "image_url": "https://example.com/squat-heels-error.jpg"}
    ]'::jsonb,
    safety_tips = ARRAY[
        'Calienta siempre antes de hacer sentadillas',
        'Si sientes dolor en las rodillas, detente inmediatamente',
        'Comienza con el peso corporal antes de añadir carga',
        'Respira correctamente: inhala bajando, exhala subiendo'
    ],
    muscles_diagram_url = 'https://example.com/squat-muscles-diagram.jpg',
    difficulty_level = 'Beginner',
    estimated_duration = 30,
    target_muscles = ARRAY['Quadriceps', 'Glutes', 'Hamstrings'],
    secondary_muscles = ARRAY['Core', 'Calves'],
    equipment_needed = ARRAY['Bodyweight'],
    prerequisites = ARRAY['Ninguno']
WHERE name = 'Sentadillas';

UPDATE exercises SET
    video_url = 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    gif_url = 'https://example.com/pushup-animation.gif',
    tutorial_steps = ARRAY[
        'Colócate en posición de plancha con las manos separadas al ancho de hombros',
        'Mantén el cuerpo en línea recta desde la cabeza hasta los talones',
        'Baja lentamente doblando los codos',
        'Mantén los codos a 45 grados del cuerpo',
        'Empuja hacia arriba hasta extender completamente los brazos'
    ],
    common_mistakes = '[
        {"title": "Caderas altas", "description": "Las caderas no deben estar demasiado altas o bajas, mantén el cuerpo recto", "image_url": "https://example.com/pushup-hips-error.jpg"},
        {"title": "Cabeza mirando abajo", "description": "Mantén la mirada al frente para mantener el cuello alineado", "image_url": "https://example.com/pushup-head-error.jpg"},
        {"title": "Codas muy separados", "description": "Los codos deben formar un ángulo de 45 grados, no 90 grados", "image_url": "https://example.com/pushup-elbows-error.jpg"}
    ]'::jsonb,
    safety_tips = ARRAY[
        'No hagas flexiones si tienes dolor en hombros o muñecas',
        'Comienza con flexiones de rodillas si eres principiante',
        'Mantén el core activado durante todo el movimiento',
        'Si sientes dolor, detente y consulta a un profesional'
    ],
    muscles_diagram_url = 'https://example.com/pushup-muscles-diagram.jpg',
    difficulty_level = 'Beginner',
    estimated_duration = 20,
    target_muscles = ARRAY['Chest', 'Triceps', 'Shoulders'],
    secondary_muscles = ARRAY['Core'],
    equipment_needed = ARRAY['Bodyweight'],
    prerequisites = ARRAY['Plancha básica']
WHERE name = 'Flexiones';

UPDATE exercises SET
    video_url = 'https://www.youtube.com/watch?v=gRVjAtPip0Y',
    gif_url = 'https://example.com/bench-press-animation.gif',
    tutorial_steps = ARRAY[
        'Acuéstate en el banco con la barra sobre tus ojos',
        'Agarra la barra con las manos separadas al ancho de hombros',
        'Baja la barra lentamente hasta tocar el pecho',
        'Mantén los codos a 45 grados del cuerpo',
        'Empuja la barra hacia arriba hasta extender completamente los brazos'
    ],
    common_mistakes = '[
        {"title": "Barra no alineada", "description": "La barra debe bajar en línea recta sobre el pecho, no hacia el cuello", "image_url": "https://example.com/bench-press-path-error.jpg"},
        {"title": "Codos separados", "description": "Mantén los codos a 45 grados para proteger los hombros", "image_url": "https://example.com/bench-press-elbows-error.jpg"},
        {"title": "Piernas flotando", "description": "Mantén los pies firmes en el suelo para estabilidad", "image_url": "https://example.com/bench-press-feet-error.jpg"}
    ]'::jsonb,
    safety_tips = ARRAY[
        'Siempre usa un observador cuando levantes pesos pesados',
        'Calienta adecuadamente antes de press de banca',
        'No rebotes la barra en el pecho',
        'Si usas mancuernas, controla el movimiento en todo momento'
    ],
    muscles_diagram_url = 'https://example.com/bench-press-muscles-diagram.jpg',
    difficulty_level = 'Intermediate',
    estimated_duration = 45,
    target_muscles = ARRAY['Chest', 'Triceps', 'Shoulders'],
    secondary_muscles = ARRAY['Core'],
    equipment_needed = ARRAY['Barbell', 'Bench'],
    prerequisites = ARRAY['Flexiones', 'Press militar básico']
WHERE name = 'Press de Banca (Barra)';

-- Add a comment to document the schema
COMMENT ON TABLE exercises IS 'Exercises table with educational content support';
COMMENT ON COLUMN exercises.video_url IS 'URL to instructional video (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN exercises.gif_url IS 'URL to animated GIF for preview';
COMMENT ON COLUMN exercises.tutorial_steps IS 'Array of step-by-step instructions';
COMMENT ON COLUMN exercises.common_mistakes IS 'JSON array of common mistakes with titles, descriptions, and images';
COMMENT ON COLUMN exercises.safety_tips IS 'Array of safety tips and precautions';
COMMENT ON COLUMN exercises.muscles_diagram_url IS 'URL to muscle diagram image';
COMMENT ON COLUMN exercises.difficulty_level IS 'Difficulty level: Beginner, Intermediate, Advanced';
COMMENT ON COLUMN exercises.target_muscles IS 'Primary muscles worked by this exercise';
COMMENT ON COLUMN exercises.secondary_muscles IS 'Secondary muscles worked by this exercise';
COMMENT ON COLUMN exercises.equipment_needed IS 'Equipment required for this exercise';
COMMENT ON COLUMN exercises.prerequisites IS 'Exercises or skills required before attempting this exercise';