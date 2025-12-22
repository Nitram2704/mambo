-- Migration: Add variations and alternative_equipment fields to exercises table
-- This enables exercise variations by difficulty level and alternative equipment options

-- Add new columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS variations JSONB;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS alternative_equipment TEXT[];

-- Create index for variations (JSONB) for better query performance
CREATE INDEX IF NOT EXISTS idx_exercises_variations ON exercises USING GIN (variations);

-- Create index for alternative_equipment (GIN for array)
CREATE INDEX IF NOT EXISTS idx_exercises_alternative_equipment ON exercises USING GIN (alternative_equipment);

-- Add comments to document the new columns
COMMENT ON COLUMN exercises.variations IS 'JSON array of exercise variations with title, level, and description';
COMMENT ON COLUMN exercises.alternative_equipment IS 'Array of alternative equipment options for this exercise';

-- Example seed data for variations and alternative equipment
-- Update Sentadillas with variations and alternatives
UPDATE exercises SET
    variations = '[
        {"title": "Sentadilla con salto", "level": "Advanced", "description": "Añade un salto explosivo al final de cada repetición para aumentar la intensidad"},
        {"title": "Sentadilla búlgara", "level": "Intermediate", "description": "Una pierna elevada en un banco detrás para mayor desafío de equilibrio"},
        {"title": "Sentadilla con pausa", "level": "Intermediate", "description": "Mantén la posición baja por 2-3 segundos antes de subir"}
    ]'::jsonb,
    alternative_equipment = ARRAY['Mancuernas', 'Barra', 'Máquina Smith', 'Bandas elásticas']
WHERE name = 'Sentadillas';

-- Update Flexiones with variations and alternatives
UPDATE exercises SET
    variations = '[
        {"title": "Flexiones diamante", "level": "Advanced", "description": "Manos juntas formando un diamante para enfatizar tríceps"},
        {"title": "Flexiones con elevación de piernas", "level": "Advanced", "description": "Piernas elevadas en un banco para aumentar la dificultad"},
        {"title": "Flexiones de rodillas", "level": "Beginner", "description": "De rodillas para reducir la resistencia y facilitar el aprendizaje"}
    ]'::jsonb,
    alternative_equipment = ARRAY['Mancuernas', 'Bandas elásticas', 'Máquina de pecho']
WHERE name = 'Flexiones';

-- Update Press de Banca with variations and alternatives
UPDATE exercises SET
    variations = '[
        {"title": "Press de banca inclinado", "level": "Intermediate", "description": "Banco inclinado para enfatizar la parte superior del pecho"},
        {"title": "Press de banca declinado", "level": "Advanced", "description": "Banco declinado para trabajar la parte inferior del pecho"},
        {"title": "Press de banca con pausa", "level": "Intermediate", "description": "Pausa de 2 segundos en el pecho para aumentar la tensión"}
    ]'::jsonb,
    alternative_equipment = ARRAY['Mancuernas', 'Máquina de pecho', 'Bandas elásticas']
WHERE name = 'Press de Banca (Barra)';