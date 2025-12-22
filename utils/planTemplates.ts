import { WorkoutPlan, Routine } from './planGenerator';

export interface TemplateExercise {
    name: string;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
}

export interface TemplateDay {
    dayName: string;
    exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    description: string;
    goal: 'hypertrophy' | 'strength' | 'endurance' | 'general';
    level: 'beginner' | 'intermediate' | 'advanced';
    daysPerWeek: number;
    days: TemplateDay[];
}

/**
 * Comprehensive workout templates organized by goal and level
 */
export const WORKOUT_TEMPLATES: Record<string, WorkoutTemplate> = {
    // ============================================
    // PRINCIPIANTE - HIPERTROFIA
    // ============================================
    beginner_hypertrophy_3d: {
        id: 'beginner_hypertrophy_3d',
        name: 'Hipertrofia Principiante',
        description: 'Plan de 3 días full body enfocado en construir masa muscular con ejercicios básicos',
        goal: 'hypertrophy',
        level: 'beginner',
        daysPerWeek: 3,
        days: [
            {
                dayName: 'Full Body A',
                exercises: [
                    { name: 'Sentadilla Goblet', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Press de Banca con Mancuernas', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Press de Hombros', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Curl de Bíceps', sets: 2, reps: '12-15', rest: 60 },
                    { name: 'Extensión de Tríceps', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Full Body B',
                exercises: [
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Press Inclinado', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Jalón al Pecho', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl Martillo', sets: 2, reps: '12-15', rest: 60 },
                    { name: 'Fondos en Banco', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Full Body C',
                exercises: [
                    { name: 'Prensa de Piernas', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Aperturas con Mancuernas', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Remo en Máquina', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Curl en Polea', sets: 2, reps: '12-15', rest: 60 },
                    { name: 'Pushdown de Tríceps', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
        ],
    },

    // ============================================
    // PRINCIPIANTE - FUERZA
    // ============================================
    beginner_strength_3d: {
        id: 'beginner_strength_3d',
        name: 'Fuerza Principiante',
        description: 'Plan 3 días enfocado en los movimientos básicos de fuerza con progresión lineal',
        goal: 'strength',
        level: 'beginner',
        daysPerWeek: 3,
        days: [
            {
                dayName: 'Día A - Sentadilla',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 5, reps: '5', rest: 180, notes: 'Añade peso cada sesión' },
                    { name: 'Press de Banca', sets: 5, reps: '5', rest: 180 },
                    { name: 'Remo con Barra', sets: 5, reps: '5', rest: 120 },
                ],
            },
            {
                dayName: 'Día B - Press',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 5, reps: '5', rest: 180 },
                    { name: 'Press Militar', sets: 5, reps: '5', rest: 180 },
                    { name: 'Peso Muerto', sets: 1, reps: '5', rest: 180, notes: 'Un set pesado' },
                ],
            },
            {
                dayName: 'Día C - Peso Muerto',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 5, reps: '5', rest: 180 },
                    { name: 'Press de Banca', sets: 5, reps: '5', rest: 180 },
                    { name: 'Peso Muerto', sets: 5, reps: '5', rest: 180 },
                ],
            },
        ],
    },

    // ============================================
    // INTERMEDIO - HIPERTROFIA (PPL)
    // ============================================
    intermediate_hypertrophy_ppl: {
        id: 'intermediate_hypertrophy_ppl',
        name: 'PPL Hipertrofia',
        description: 'Push/Pull/Legs clásico para maximizar el crecimiento muscular',
        goal: 'hypertrophy',
        level: 'intermediate',
        daysPerWeek: 6,
        days: [
            {
                dayName: 'Push A',
                exercises: [
                    { name: 'Press de Banca', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Press Inclinado con Mancuernas', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Press Militar', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensiones de Tríceps', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Pushdown de Tríceps', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Pull A',
                exercises: [
                    { name: 'Peso Muerto', sets: 4, reps: '5-6', rest: 180 },
                    { name: 'Dominadas', sets: 4, reps: '6-10', rest: 120 },
                    { name: 'Remo con Barra', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Curl de Bíceps con Barra', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Curl Martillo', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Legs A',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 4, reps: '6-8', rest: 180 },
                    { name: 'Peso Muerto Rumano', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Curl Femoral', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Push B',
                exercises: [
                    { name: 'Press Militar', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Press de Banca Inclinado', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Aperturas con Mancuernas', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevaciones Frontales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Dips', sets: 3, reps: '8-12', rest: 90 },
                    { name: 'Extensiones sobre la Cabeza', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Pull B',
                exercises: [
                    { name: 'Remo con Mancuerna', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Jalón al Pecho', sets: 4, reps: '10-12', rest: 90 },
                    { name: 'Remo en Máquina', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Encogimientos', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl Predicador', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Curl en Polea', sets: 3, reps: '15-20', rest: 45 },
                ],
            },
            {
                dayName: 'Legs B',
                exercises: [
                    { name: 'Sentadilla Frontal', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Zancadas con Mancuernas', sets: 2, reps: '10 por pierna', rest: 90 },
                    { name: 'Curl Femoral Sentado', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: 90 },
                    { name: 'Elevación de Gemelos Sentado', sets: 4, reps: '15-20', rest: 45 },
                ],
            },
        ],
    },

    // ============================================
    // INTERMEDIO - FUERZA (Upper/Lower)
    // ============================================
    intermediate_strength_ul: {
        id: 'intermediate_strength_ul',
        name: 'Upper/Lower Fuerza',
        description: 'Split 4 días enfocado en ganar fuerza en los levantamientos principales',
        goal: 'strength',
        level: 'intermediate',
        daysPerWeek: 4,
        days: [
            {
                dayName: 'Upper A - Empuje',
                exercises: [
                    { name: 'Press de Banca', sets: 5, reps: '5', rest: 180 },
                    { name: 'Press Militar', sets: 4, reps: '6', rest: 150 },
                    { name: 'Remo con Barra', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Dips', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Face Pull', sets: 3, reps: '15', rest: 60 },
                ],
            },
            {
                dayName: 'Lower A - Sentadilla',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 5, reps: '5', rest: 180 },
                    { name: 'Peso Muerto Rumano', sets: 4, reps: '8', rest: 120 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '10', rest: 90 },
                    { name: 'Curl Femoral', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 4, reps: '12', rest: 60 },
                ],
            },
            {
                dayName: 'Upper B - Tracción',
                exercises: [
                    { name: 'Press de Banca Inclinado', sets: 4, reps: '6-8', rest: 150 },
                    { name: 'Dominadas Lastradas', sets: 4, reps: '5-8', rest: 150 },
                    { name: 'Press Militar con Mancuernas', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Curl con Barra', sets: 3, reps: '10', rest: 60 },
                ],
            },
            {
                dayName: 'Lower B - Peso Muerto',
                exercises: [
                    { name: 'Peso Muerto', sets: 5, reps: '5', rest: 180 },
                    { name: 'Sentadilla Frontal', sets: 4, reps: '6-8', rest: 150 },
                    { name: 'Hip Thrust', sets: 3, reps: '10', rest: 90 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 4, reps: '12-15', rest: 60 },
                ],
            },
        ],
    },

    // ============================================
    // AVANZADO - HIPERTROFIA
    // ============================================
    advanced_hypertrophy_5d: {
        id: 'advanced_hypertrophy_5d',
        name: 'Bro Split Avanzado',
        description: 'Un grupo muscular por día con alto volumen para máximo crecimiento',
        goal: 'hypertrophy',
        level: 'advanced',
        daysPerWeek: 5,
        days: [
            {
                dayName: 'Pecho',
                exercises: [
                    { name: 'Press de Banca', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Press Inclinado con Mancuernas', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Press Declinado', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Aperturas en Polea', sets: 4, reps: '12-15', rest: 60 },
                    { name: 'Pullover', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Espalda',
                exercises: [
                    { name: 'Peso Muerto', sets: 4, reps: '5-6', rest: 180 },
                    { name: 'Dominadas', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Remo con Barra', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Remo en Máquina', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Jalón al Pecho Agarre Cerrado', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Hombros',
                exercises: [
                    { name: 'Press Militar', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Press Arnold', sets: 4, reps: '10-12', rest: 90 },
                    { name: 'Elevaciones Laterales', sets: 4, reps: '12-15', rest: 60 },
                    { name: 'Pájaros', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Encogimientos', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Piernas',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 4, reps: '6-8', rest: 180 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '10-12', rest: 120 },
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl Femoral', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 4, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Brazos',
                exercises: [
                    { name: 'Curl con Barra', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Press Francés', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Curl Predicador', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Pushdown de Tríceps', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Curl Martillo', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensiones sobre la Cabeza', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
        ],
    },

    // ============================================
    // AVANZADO - FUERZA (Powerlifting)
    // ============================================
    advanced_strength_powerlifting: {
        id: 'advanced_strength_powerlifting',
        name: 'Powerlifting Avanzado',
        description: 'Programa de 4 días enfocado en los 3 levantamientos principales',
        goal: 'strength',
        level: 'advanced',
        daysPerWeek: 4,
        days: [
            {
                dayName: 'Sentadilla Heavy',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 5, reps: '3-5', rest: 240, notes: '85-90% 1RM' },
                    { name: 'Sentadilla con Pausa', sets: 3, reps: '3', rest: 180 },
                    { name: 'Good Morning', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Press Heavy',
                exercises: [
                    { name: 'Press de Banca', sets: 5, reps: '3-5', rest: 240, notes: '85-90% 1RM' },
                    { name: 'Press con Pausa', sets: 3, reps: '3', rest: 180 },
                    { name: 'Press Inclinado', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Extensiones de Tríceps', sets: 3, reps: '10-12', rest: 60 },
                ],
            },
            {
                dayName: 'Peso Muerto Heavy',
                exercises: [
                    { name: 'Peso Muerto', sets: 5, reps: '3-5', rest: 240, notes: '85-90% 1RM' },
                    { name: 'Peso Muerto con Déficit', sets: 3, reps: '5', rest: 180 },
                    { name: 'Remo con Barra', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Curl Femoral', sets: 3, reps: '10-12', rest: 60 },
                ],
            },
            {
                dayName: 'Volumen Accessorios',
                exercises: [
                    { name: 'Sentadilla Frontal', sets: 4, reps: '6-8', rest: 150 },
                    { name: 'Press de Banca Cerrado', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Dominadas Lastradas', sets: 4, reps: '6-8', rest: 120 },
                    { name: 'Hip Thrust', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                ],
            },
        ],
    },

    // ============================================
    // PRINCIPIANTE - RESISTENCIA
    // ============================================
    beginner_endurance_3d: {
        id: 'beginner_endurance_3d',
        name: 'Resistencia Principiante',
        description: 'Circuitos de cuerpo completo para mejorar resistencia y quemar grasa',
        goal: 'endurance',
        level: 'beginner',
        daysPerWeek: 3,
        days: [
            {
                dayName: 'Circuito A',
                exercises: [
                    { name: 'Sentadillas', sets: 3, reps: '15-20', rest: 45 },
                    { name: 'Flexiones', sets: 3, reps: '12-15', rest: 45 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '15', rest: 45 },
                    { name: 'Zancadas', sets: 3, reps: '12 por pierna', rest: 45 },
                    { name: 'Plancha', sets: 3, reps: '30-45 seg', rest: 45 },
                ],
            },
            {
                dayName: 'Circuito B',
                exercises: [
                    { name: 'Burpees', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Mountain Climbers', sets: 3, reps: '20', rest: 45 },
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '15', rest: 45 },
                    { name: 'Push Press', sets: 3, reps: '12-15', rest: 45 },
                    { name: 'Russian Twist', sets: 3, reps: '20', rest: 45 },
                ],
            },
            {
                dayName: 'Circuito C',
                exercises: [
                    { name: 'Saltos de Tijera', sets: 3, reps: '30', rest: 30 },
                    { name: 'Sentadilla con Salto', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Press de Hombros', sets: 3, reps: '15', rest: 45 },
                    { name: 'Step Ups', sets: 3, reps: '12 por pierna', rest: 45 },
                    { name: 'Plancha Lateral', sets: 3, reps: '20 seg por lado', rest: 45 },
                ],
            },
        ],
    },

    // ============================================
    // INTERMEDIO - GENERAL (Fitness)
    // ============================================
    intermediate_general_4d: {
        id: 'intermediate_general_4d',
        name: 'Fitness Completo',
        description: 'Balance perfecto entre fuerza, resistencia y composición corporal',
        goal: 'general',
        level: 'intermediate',
        daysPerWeek: 4,
        days: [
            {
                dayName: 'Upper Body + Core',
                exercises: [
                    { name: 'Press de Banca', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Remo con Barra', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Press Militar', sets: 3, reps: '10-12', rest: 75 },
                    { name: 'Face Pull', sets: 3, reps: '15', rest: 60 },
                    { name: 'Curl con Mancuernas', sets: 3, reps: '12', rest: 60 },
                    { name: 'Plancha', sets: 3, reps: '1 min', rest: 45 },
                ],
            },
            {
                dayName: 'Lower Body + Cardio',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Peso Muerto Rumano', sets: 4, reps: '10-12', rest: 90 },
                    { name: 'Zancadas Caminando', sets: 3, reps: '12 por pierna', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 4, reps: '15', rest: 45 },
                    { name: 'Burpees', sets: 3, reps: '10', rest: 60 },
                ],
            },
            {
                dayName: 'Push + Accessorios',
                exercises: [
                    { name: 'Press Inclinado', sets: 4, reps: '8-10', rest: 90 },
                    { name: 'Dips', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Elevaciones Laterales', sets: 4, reps: '12-15', rest: 60 },
                    { name: 'Extensiones de Tríceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Abdominales en Polea', sets: 3, reps: '15', rest: 45 },
                ],
            },
            {
                dayName: 'Pull + Piernas',
                exercises: [
                    { name: 'Dominadas', sets: 4, reps: '6-10', rest: 120 },
                    { name: 'Remo con Mancuerna', sets: 4, reps: '10-12', rest: 75 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Curl Femoral', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl de Bíceps', sets: 3, reps: '12', rest: 60 },
                ],
            },
        ],
    },
    // ============================================
    // INTERMEDIO - TORSO/PIERNA
    // ============================================
    intermediate_torso_pierna_4d: {
        id: 'intermediate_torso_pierna_4d',
        name: 'Torso/Pierna Hipertrofia',
        description: 'Split de 4 días ideal para frecuencia 2 y máximo crecimiento muscular',
        goal: 'hypertrophy',
        level: 'intermediate',
        daysPerWeek: 4,
        days: [
            {
                dayName: 'Torso A',
                exercises: [
                    { name: 'Press de Banca', sets: 3, reps: '6-8', rest: 120 },
                    { name: 'Remo con Barra', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Press Militar con Mancuernas', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Jalón al Pecho', sets: 3, reps: '10-12', rest: 75 },
                    { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl de Bíceps', sets: 2, reps: '12-15', rest: 60 },
                    { name: 'Pushdown de Tríceps', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Pierna A',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 3, reps: '6-8', rest: 180 },
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Curl Femoral', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Torso B',
                exercises: [
                    { name: 'Press Inclinado', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Dominadas', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Dips', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '10-12', rest: 75 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Curl Martillo', sets: 2, reps: '12-15', rest: 60 },
                    { name: 'Extensiones sobre la Cabeza', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Pierna B',
                exercises: [
                    { name: 'Peso Muerto', sets: 3, reps: '5-6', rest: 180 },
                    { name: 'Sentadilla Frontal', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Zancadas', sets: 3, reps: '10 por pierna', rest: 90 },
                    { name: 'Curl Femoral Sentado', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevación de Gemelos Sentado', sets: 3, reps: '15-20', rest: 45 },
                ],
            },
        ],
    },
    // ============================================
    // PRINCIPIANTE - FULL BODY EXPRESS
    // ============================================
    beginner_fullbody_express_2d: {
        id: 'beginner_fullbody_express_2d',
        name: 'Full Body Express',
        description: 'Plan de 2 días para personas con poco tiempo que quieren mantenerse en forma',
        goal: 'general',
        level: 'beginner',
        daysPerWeek: 2,
        days: [
            {
                dayName: 'Sesión A',
                exercises: [
                    { name: 'Sentadilla Goblet', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Flexiones', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Press de Hombros', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Plancha', sets: 3, reps: '45 seg', rest: 45 },
                ],
            },
            {
                dayName: 'Sesión B',
                exercises: [
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Press de Banca con Mancuernas', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Jalón al Pecho', sets: 3, reps: '12-15', rest: 75 },
                    { name: 'Zancadas', sets: 3, reps: '12 por pierna', rest: 60 },
                    { name: 'Elevaciones de Piernas', sets: 3, reps: '15', rest: 45 },
                ],
            },
        ],
    },
    // ============================================
    // INTERMEDIO - ESPECIALIZACIÓN GLÚTEOS
    // ============================================
    intermediate_glute_specialization_3d: {
        id: 'intermediate_glute_specialization_3d',
        name: 'Especialización Glúteos',
        description: 'Enfoque intenso en glúteos y piernas para máxima estética y fuerza',
        goal: 'hypertrophy',
        level: 'intermediate',
        daysPerWeek: 3,
        days: [
            {
                dayName: 'Día A - Glúteo Pesado',
                exercises: [
                    { name: 'Hip Thrust', sets: 4, reps: '8-10', rest: 120 },
                    { name: 'Sentadilla con Barra', sets: 3, reps: '10-12', rest: 120 },
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Abducción de Cadera', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Patada de Glúteo', sets: 3, reps: '15 por pierna', rest: 60 },
                    { name: 'Face Pull', sets: 3, reps: '15', rest: 60 },
                ],
            },
            {
                dayName: 'Día B - Torso + Glúteo',
                exercises: [
                    { name: 'Press Militar', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Remo con Mancuerna', sets: 3, reps: '10-12', rest: 75 },
                    { name: 'Zancadas Búlgaras', sets: 3, reps: '10-12 por pierna', rest: 90 },
                    { name: 'Step Ups', sets: 3, reps: '12 por pierna', rest: 60 },
                    { name: 'Flexiones', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Plancha Lateral', sets: 3, reps: '30 seg por lado', rest: 45 },
                ],
            },
            {
                dayName: 'Día C - Volumen Glúteo',
                exercises: [
                    { name: 'Hip Thrust con Pausa', sets: 4, reps: '12-15', rest: 90 },
                    { name: 'Peso Muerto Sumo', sets: 3, reps: '10-12', rest: 120 },
                    { name: 'Prensa de Piernas (Pies altos)', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Frog Pumps', sets: 3, reps: '20-30', rest: 45 },
                    { name: 'Clamshells', sets: 3, reps: '20 por pierna', rest: 45 },
                    { name: 'Jalón al Pecho', sets: 3, reps: '12-15', rest: 60 },
                ],
            },
        ],
    },
    // ============================================
    // AVANZADO - METCON & CONDITIONING
    // ============================================
    advanced_metcon_conditioning_4d: {
        id: 'advanced_metcon_conditioning_4d',
        name: 'Metcon & Conditioning',
        description: 'Alta intensidad para mejorar capacidad cardiovascular y resistencia muscular',
        goal: 'endurance',
        level: 'advanced',
        daysPerWeek: 4,
        days: [
            {
                dayName: 'Metcon A - EMOM',
                exercises: [
                    { name: 'Burpees', sets: 4, reps: '12', rest: 60 },
                    { name: 'Kettlebell Swings', sets: 4, reps: '20', rest: 60 },
                    { name: 'Push Press', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Box Jumps', sets: 3, reps: '10', rest: 60 },
                    { name: 'Mountain Climbers', sets: 2, reps: '40', rest: 45 },
                    { name: 'Plancha', sets: 2, reps: '1 min', rest: 45 },
                ],
            },
            {
                dayName: 'Metcon B - AMRAP',
                exercises: [
                    { name: 'Sentadilla con Salto', sets: 4, reps: '15', rest: 45 },
                    { name: 'Flexiones Diamante', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Remo en Polea', sets: 3, reps: '15', rest: 60 },
                    { name: 'Zancadas con Salto', sets: 3, reps: '20', rest: 45 },
                    { name: 'V-Ups', sets: 3, reps: '15', rest: 45 },
                    { name: 'Saltos de Tijera', sets: 2, reps: '50', rest: 30 },
                ],
            },
            {
                dayName: 'Metcon C - Chipper',
                exercises: [
                    { name: 'Thrusters', sets: 4, reps: '12', rest: 60 },
                    { name: 'Dominadas', sets: 3, reps: '10', rest: 90 },
                    { name: 'Peso Muerto', sets: 3, reps: '10', rest: 90 },
                    { name: 'Dips', sets: 3, reps: '12', rest: 60 },
                    { name: 'Russian Twist', sets: 3, reps: '30', rest: 45 },
                    { name: 'Burpees', sets: 2, reps: '15', rest: 60 },
                ],
            },
            {
                dayName: 'Metcon D - Core & HIIT',
                exercises: [
                    { name: 'Sprints', sets: 5, reps: '30 seg', rest: 30 },
                    { name: 'Plancha con Toque de Hombros', sets: 3, reps: '20', rest: 45 },
                    { name: 'Bicycle Crunches', sets: 3, reps: '30', rest: 45 },
                    { name: 'Elevaciones de Piernas', sets: 3, reps: '15', rest: 45 },
                    { name: 'Superman', sets: 3, reps: '15', rest: 45 },
                    { name: 'Plancha Lateral', sets: 3, reps: '45 seg por lado', rest: 45 },
                ],
            },
        ],
    },
    // ============================================
    // AVANZADO - PPL POWERBUILDING
    // ============================================
    advanced_ppl_powerbuilding_6d: {
        id: 'advanced_ppl_powerbuilding_6d',
        name: 'PPL Powerbuilding',
        description: 'Lo mejor de dos mundos: fuerza pesada y volumen de hipertrofia',
        goal: 'strength',
        level: 'advanced',
        daysPerWeek: 6,
        days: [
            {
                dayName: 'Push - Fuerza',
                exercises: [
                    { name: 'Press de Banca', sets: 4, reps: '3-5', rest: 180 },
                    { name: 'Press Militar', sets: 3, reps: '5-8', rest: 150 },
                    { name: 'Press Inclinado con Mancuernas', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Dips Lastrados', sets: 3, reps: '8-10', rest: 90 },
                    { name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Press Francés', sets: 2, reps: '10-12', rest: 60 },
                    { name: 'Pushdown de Tríceps', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Pull - Fuerza',
                exercises: [
                    { name: 'Peso Muerto', sets: 3, reps: '3-5', rest: 240 },
                    { name: 'Dominadas Lastradas', sets: 3, reps: '5-8', rest: 180 },
                    { name: 'Remo con Barra', sets: 3, reps: '8-10', rest: 120 },
                    { name: 'Jalón al Pecho', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Face Pull', sets: 3, reps: '15-20', rest: 60 },
                    { name: 'Curl con Barra', sets: 3, reps: '8-10', rest: 60 },
                    { name: 'Curl Martillo', sets: 2, reps: '12-15', rest: 60 },
                ],
            },
            {
                dayName: 'Legs - Fuerza',
                exercises: [
                    { name: 'Sentadilla con Barra', sets: 4, reps: '3-5', rest: 240 },
                    { name: 'Peso Muerto Rumano', sets: 3, reps: '8-10', rest: 150 },
                    { name: 'Prensa de Piernas', sets: 3, reps: '10-12', rest: 120 },
                    { name: 'Curl Femoral', sets: 3, reps: '10-12', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevación de Gemelos', sets: 4, reps: '10-12', rest: 60 },
                ],
            },
            {
                dayName: 'Push - Hipertrofia',
                exercises: [
                    { name: 'Press Militar con Mancuernas', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Press de Banca Inclinado', sets: 3, reps: '10-12', rest: 90 },
                    { name: 'Aperturas con Mancuernas', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Elevaciones Laterales en Polea', sets: 3, reps: '15-20', rest: 45 },
                    { name: 'Elevaciones Frontales', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensiones sobre la Cabeza', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Patada de Tríceps', sets: 2, reps: '15', rest: 45 },
                ],
            },
            {
                dayName: 'Pull - Hipertrofia',
                exercises: [
                    { name: 'Remo con Mancuerna', sets: 3, reps: '10-12', rest: 75 },
                    { name: 'Remo en Polea Baja', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Jalón al Pecho Agarre Cerrado', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Encogimientos con Mancuernas', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Pájaros', sets: 3, reps: '15-20', rest: 45 },
                    { name: 'Curl Predicador', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Curl en Polea', sets: 2, reps: '15-20', rest: 45 },
                ],
            },
            {
                dayName: 'Legs - Hipertrofia',
                exercises: [
                    { name: 'Sentadilla Frontal', sets: 3, reps: '10-12', rest: 120 },
                    { name: 'Zancadas Caminando', sets: 3, reps: '12 por pierna', rest: 90 },
                    { name: 'Hip Thrust', sets: 3, reps: '12-15', rest: 90 },
                    { name: 'Curl Femoral Sentado', sets: 3, reps: '12-15', rest: 60 },
                    { name: 'Extensión de Cuádriceps', sets: 3, reps: '15-20', rest: 45 },
                    { name: 'Elevación de Gemelos Sentado', sets: 3, reps: '15-20', rest: 45 },
                    { name: 'Abductores en Máquina', sets: 2, reps: '20', rest: 45 },
                ],
            },
        ],
    },
};

/**
 * Get a single workout template by ID
 */
export function getWorkoutTemplate(id: string): WorkoutTemplate | null {
    return WORKOUT_TEMPLATES[id] || null;
}

/**
 * List all available templates with summary info
 */
export function listWorkoutTemplates() {
    return Object.values(WORKOUT_TEMPLATES).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        goal: template.goal,
        level: template.level,
        daysPerWeek: template.daysPerWeek,
    }));
}

/**
 * Filter templates by goal and level
 */
export function filterTemplates(goal?: string, level?: string) {
    return Object.values(WORKOUT_TEMPLATES).filter(template => {
        const matchesGoal = !goal || goal === 'all' || template.goal === goal;
        const matchesLevel = !level || level === 'all' || template.level === level;
        return matchesGoal && matchesLevel;
    });
}
