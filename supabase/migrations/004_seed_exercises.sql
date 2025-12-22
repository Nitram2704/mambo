-- Script para poblar tabla exercises con ejercicios básicos
-- Ejecutar DESPUÉS de crear las tablas principales

-- Verificar si la tabla está vacía
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM exercises LIMIT 1) THEN
        -- Insertar ejercicios básicos de peso corporal (sin user_id, disponibles para todos)
        INSERT INTO exercises (name, category, muscle_group, equipment) VALUES
        -- Pecho
        ('Flexiones', 'Strength', 'Chest', 'Bodyweight'),
        ('Flexiones Inclinadas', 'Strength', 'Chest', 'Bodyweight'),
        ('Flexiones Declinadas', 'Strength', 'Chest', 'Bodyweight'),
        
        -- Espalda
        ('Dominadas', 'Strength', 'Back', 'Bodyweight'),
        ('Remo Invertido', 'Strength', 'Back', 'Bodyweight'),
        ('Superman', 'Strength', 'Back', 'Bodyweight'),
        
        -- Piernas
        ('Sentadillas', 'Strength', 'Legs', 'Bodyweight'),
        ('Zancadas', 'Strength', 'Legs', 'Bodyweight'),
        ('Sentadilla Búlgara', 'Strength', 'Legs', 'Bodyweight'),
        ('Elevación de Gemelos', 'Strength', 'Legs', 'Bodyweight'),
        
        -- Hombros
        ('Pike Push-ups', 'Strength', 'Shoulders', 'Bodyweight'),
        ('Handstand Push-ups', 'Strength', 'Shoulders', 'Bodyweight'),
        
        -- Brazos
        ('Fondos en Banco', 'Strength', 'Arms', 'Bodyweight'),
        ('Curl Isométrico', 'Strength', 'Arms', 'Bodyweight'),
        
        -- Core
        ('Plancha Abdominal', 'Strength', 'Core', 'Bodyweight'),
        ('Plancha Lateral', 'Strength', 'Core', 'Bodyweight'),
        ('Crunch Abdominal', 'Strength', 'Core', 'Bodyweight'),
        ('Mountain Climbers', 'Cardio', 'Core', 'Bodyweight'),
        ('Russian Twist', 'Strength', 'Core', 'Bodyweight'),
        
        -- Cardio
        ('Burpees', 'Cardio', 'Cardio', 'Bodyweight'),
        ('Saltos de Tijera', 'Cardio', 'Cardio', 'Bodyweight'),
        ('High Knees', 'Cardio', 'Cardio', 'Bodyweight'),
        ('Saltos de Cuerda', 'Cardio', 'Cardio', 'Bodyweight');
        
        RAISE NOTICE 'Se insertaron % ejercicios básicos', (SELECT COUNT(*) FROM exercises);
    ELSE
        RAISE NOTICE 'La tabla exercises ya tiene datos, no se insertaron ejercicios';
    END IF;
END $$;
