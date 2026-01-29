-- Ensure UNIQUE constraint on lesson_id for academy_quizzes
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'academy_quizzes_lesson_id_key'
    ) THEN 
        ALTER TABLE academy_quizzes ADD CONSTRAINT academy_quizzes_lesson_id_key UNIQUE (lesson_id);
    END IF;
END $$;

-- Seed data for academy_courses
INSERT INTO academy_courses (id, title, description, category, difficulty, xp_reward, is_premium)
VALUES 
('c1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Fundamentos de Nutrición', 'Aprende las bases de una alimentación saludable para maximizar tus resultados.', 'nutrition', 'beginner', 150, false),
('c2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Hipertrofia Avanzada', 'Técnicas avanzadas de entrenamiento para maximizar el crecimiento muscular.', 'training', 'advanced', 300, true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    xp_reward = EXCLUDED.xp_reward,
    is_premium = EXCLUDED.is_premium;

-- Seed data for academy_lessons
INSERT INTO academy_lessons (id, course_id, title, content, duration_minutes, order_index)
VALUES 
('e1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'c1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Los Macronutrientes', '# Introducción a los Macronutrientes\n\nLos macronutrientes son los nutrientes que el cuerpo necesita en grandes cantidades para funcionar correctamente. Hay tres tipos principales:\n\n1. **Proteínas**: Esenciales para la reparación y crecimiento de tejidos.\n2. **Carbohidratos**: La principal fuente de energía del cuerpo.\n3. **Grasas**: Importantes para la producción de hormonas y salud celular.\n\n## ¿Cuánta proteína necesito?\n\nPara personas activas, se recomienda entre 1.6g y 2.2g de proteína por kilo de peso corporal.', 5, 1),
('e2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'c1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'El Balance Energético', '# El Balance Energético\n\nEl factor más importante para perder o ganar peso es el balance entre las calorías que consumes y las que quemas.\n\n* **Superávit calórico**: Consumir más de lo que quemas (para ganar masa).\n* **Déficit calórico**: Consumir menos de lo que quemas (para perder grasa).\n* **Mantenimiento**: Consumir lo mismo que quemas.', 7, 2)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    duration_minutes = EXCLUDED.duration_minutes,
    order_index = EXCLUDED.order_index;

-- Seed data for academy_quizzes
INSERT INTO academy_quizzes (lesson_id, questions, passing_score)
VALUES 
('e1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '[
    {
        "question": "¿Cuál es la principal función de las proteínas?",
        "options": ["Energía inmediata", "Reparación de tejidos", "Almacenamiento de grasa", "Hidratación"],
        "correctAnswer": 1
    },
    {
        "question": "¿Cuánta proteína se recomienda para personas activas?",
        "options": ["0.5g por kg", "1.0g por kg", "1.6g - 2.2g por kg", "5g por kg"],
        "correctAnswer": 2
    }
]', 70)
ON CONFLICT (lesson_id) DO UPDATE SET
    questions = EXCLUDED.questions,
    passing_score = EXCLUDED.passing_score;
