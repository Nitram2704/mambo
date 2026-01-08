export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'abs' | 'cardio' | 'full_body' | 'other';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CommonMistake {
    title: string;
    description: string;
    image_url?: string;
}

export interface ExerciseVariation {
    title: string;
    level: DifficultyLevel;
    description: string;
}

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    equipment: 'other' | 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'band' | 'kettlebell';
    restTime?: number; // seconds
    plannedSets?: number; // number of planned sets
    plannedSetTypes?: ('warmup' | 'normal' | 'dropset' | 'failure' | 'rest_pause')[]; // array of set types for each planned set
    plannedReps?: number; // number of planned reps
    supersetGroup?: string; // ID to group exercises as superset (same ID = same superset)

    // Educational content fields
    video_url?: string;
    gif_url?: string;
    tutorial_steps?: string[];
    common_mistakes?: CommonMistake[];
    safety_tips?: string[];
    muscles_diagram_url?: string;
    difficulty_level?: DifficultyLevel;
    estimated_duration?: number; // in seconds
    target_muscles?: string[];
    secondary_muscles?: string[];
    equipment_needed?: string[];
    prerequisites?: string[];
    variations?: ExerciseVariation[];
    alternative_equipment?: string[];
    created_at?: string;
    updated_at?: string;
}

export const EXERCISES: Exercise[] = [
    // Chest
    // Chest
    { id: '1', name: 'Press de Banca (Barra)', muscleGroup: 'chest', equipment: 'barbell' },
    { id: '2', name: 'Press Inclinado (Mancuernas)', muscleGroup: 'chest', equipment: 'dumbbell' },
    { id: '3', name: 'Aperturas (Máquina)', muscleGroup: 'chest', equipment: 'machine' },
    { id: '4', name: 'Fondos (Dips)', muscleGroup: 'chest', equipment: 'bodyweight' },
    { id: '5', name: 'Cruce de Poleas', muscleGroup: 'chest', equipment: 'cable' },
    { id: '6', name: 'Press Declinado (Barra)', muscleGroup: 'chest', equipment: 'barbell' },
    { id: '7', name: 'Aperturas con Mancuernas', muscleGroup: 'chest', equipment: 'dumbbell' },
    { id: '8', name: 'Press en Máquina', muscleGroup: 'chest', equipment: 'machine' },
    { id: '9', name: 'Pull Over (Mancuerna)', muscleGroup: 'chest', equipment: 'dumbbell' },

    // Back
    { id: '10', name: 'Dominadas', muscleGroup: 'back', equipment: 'bodyweight' },
    { id: '11', name: 'Remo con Barra', muscleGroup: 'back', equipment: 'barbell' },
    { id: '12', name: 'Jalón al Pecho', muscleGroup: 'back', equipment: 'cable' },
    { id: '13', name: 'Remo Gironda', muscleGroup: 'back', equipment: 'cable' },
    { id: '14', name: 'Peso Muerto', muscleGroup: 'back', equipment: 'barbell' },
    { id: '15', name: 'Remo con Mancuerna', muscleGroup: 'back', equipment: 'dumbbell' },
    { id: '16', name: 'Jalón Agarre Cerrado', muscleGroup: 'back', equipment: 'cable' },
    { id: '17', name: 'Peso Muerto Rumano', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '18', name: 'Pull Over (Polea)', muscleGroup: 'back', equipment: 'cable' },
    { id: '19', name: 'Remo en Máquina', muscleGroup: 'back', equipment: 'machine' },

    // Legs
    { id: '20', name: 'Sentadilla (Barra)', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '21', name: 'Prensa de Piernas', muscleGroup: 'legs', equipment: 'machine' },
    { id: '22', name: 'Extensiones de Cuádriceps', muscleGroup: 'legs', equipment: 'machine' },
    { id: '23', name: 'Curl Femoral Tumbado', muscleGroup: 'legs', equipment: 'machine' },
    { id: '24', name: 'Zancadas (Mancuernas)', muscleGroup: 'legs', equipment: 'dumbbell' },
    { id: '25', name: 'Elevación de Gemelos', muscleGroup: 'legs', equipment: 'machine' },
    { id: '26', name: 'Sentadilla Frontal', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '27', name: 'Peso Muerto Sumo', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '28', name: 'Hack Squat', muscleGroup: 'legs', equipment: 'machine' },
    { id: '29', name: 'Zancadas Búlgaras', muscleGroup: 'legs', equipment: 'dumbbell' },
    { id: '30', name: 'Hip Thrust', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '31', name: 'Curl Femoral Sentado', muscleGroup: 'legs', equipment: 'machine' },
    { id: '63', name: 'Aductores', muscleGroup: 'legs', equipment: 'machine' },
    { id: '64', name: 'Abductores', muscleGroup: 'legs', equipment: 'machine' },
    { id: '65', name: 'Extensiones de Cuádriceps', muscleGroup: 'legs', equipment: 'machine' },
    { id: '66', name: 'Curl Femoral Tumbado', muscleGroup: 'legs', equipment: 'machine' },
    { id: '67', name: 'Peso Muerto Sumo', muscleGroup: 'legs', equipment: 'barbell' },
    { id: '68', name: 'Sentadilla Búlgara', muscleGroup: 'legs', equipment: 'dumbbell' },
    { id: '69', name: 'Elevación de Gemelos de Pie', muscleGroup: 'legs', equipment: 'machine' },
    { id: '70', name: 'Zancadas Inversas', muscleGroup: 'legs', equipment: 'dumbbell' },
    { id: '71', name: 'Curl Nórdico', muscleGroup: 'legs', equipment: 'bodyweight' },
    { id: '72', name: 'Patada de Glúteo', muscleGroup: 'legs', equipment: 'cable' },

    // Shoulders
    { id: '32', name: 'Press Militar (Barra)', muscleGroup: 'shoulders', equipment: 'barbell' },
    { id: '33', name: 'Elevaciones Laterales', muscleGroup: 'shoulders', equipment: 'dumbbell' },
    { id: '34', name: 'Pájaros (Posterior)', muscleGroup: 'shoulders', equipment: 'dumbbell' },
    { id: '35', name: 'Face Pull', muscleGroup: 'shoulders', equipment: 'cable' },
    { id: '36', name: 'Press Arnold', muscleGroup: 'shoulders', equipment: 'dumbbell' },
    { id: '37', name: 'Elevaciones Frontales', muscleGroup: 'shoulders', equipment: 'dumbbell' },
    { id: '38', name: 'Press en Máquina', muscleGroup: 'shoulders', equipment: 'machine' },
    { id: '39', name: 'Pájaros en Polea', muscleGroup: 'shoulders', equipment: 'cable' },
    { id: '40', name: 'Remo al Mentón', muscleGroup: 'shoulders', equipment: 'barbell' },

    // Arms
    { id: '41', name: 'Curl de Bíceps (Barra)', muscleGroup: 'biceps', equipment: 'barbell' },
    { id: '42', name: 'Curl Martillo', muscleGroup: 'biceps', equipment: 'dumbbell' },
    { id: '43', name: 'Extensiones de Tríceps (Polea)', muscleGroup: 'triceps', equipment: 'cable' },
    { id: '44', name: 'Press Francés', muscleGroup: 'triceps', equipment: 'barbell' },
    { id: '45', name: 'Curl Concentrado', muscleGroup: 'biceps', equipment: 'dumbbell' },
    { id: '46', name: 'Curl en Polea', muscleGroup: 'biceps', equipment: 'cable' },
    { id: '47', name: 'Fondos para Tríceps', muscleGroup: 'triceps', equipment: 'bodyweight' },
    { id: '48', name: 'Curl Predicador', muscleGroup: 'biceps', equipment: 'machine' },
    { id: '49', name: 'Patada de Tríceps', muscleGroup: 'triceps', equipment: 'dumbbell' },
    { id: '50', name: 'Curl Alterno', muscleGroup: 'biceps', equipment: 'dumbbell' },

    // Core
    { id: '51', name: 'Plancha Abdominal', muscleGroup: 'abs', equipment: 'bodyweight' },
    { id: '52', name: 'Crunch Abdominal', muscleGroup: 'abs', equipment: 'bodyweight' },
    { id: '53', name: 'Elevación de Piernas', muscleGroup: 'abs', equipment: 'bodyweight' },
    { id: '54', name: 'Russian Twist', muscleGroup: 'abs', equipment: 'bodyweight' },
    { id: '55', name: 'Mountain Climbers', muscleGroup: 'abs', equipment: 'bodyweight' },
    { id: '56', name: 'Abdominales en Polea', muscleGroup: 'abs', equipment: 'cable' },
    { id: '57', name: 'Plancha Lateral', muscleGroup: 'abs', equipment: 'bodyweight' },

    // Cardio
    { id: '58', name: 'Carrera (Treadmill)', muscleGroup: 'cardio', equipment: 'machine' },
    { id: '59', name: 'Bicicleta Estática', muscleGroup: 'cardio', equipment: 'machine' },
    { id: '60', name: 'Remo (Rower)', muscleGroup: 'cardio', equipment: 'machine' },
    { id: '61', name: 'Burpees', muscleGroup: 'cardio', equipment: 'bodyweight' },
    { id: '62', name: 'Saltos de Cuerda', muscleGroup: 'cardio', equipment: 'bodyweight' },
];
