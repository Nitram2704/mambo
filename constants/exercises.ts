export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
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
    equipment: string;
    restTime?: number; // seconds
    plannedSets?: number; // number of planned sets
    plannedSetTypes?: string[]; // array of set types for each planned set
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
    { id: '1', name: 'Press de Banca (Barra)', muscleGroup: 'Chest', equipment: 'Barbell' },
    { id: '2', name: 'Press Inclinado (Mancuernas)', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { id: '3', name: 'Aperturas (Máquina)', muscleGroup: 'Chest', equipment: 'Machine' },
    { id: '4', name: 'Fondos (Dips)', muscleGroup: 'Chest', equipment: 'Bodyweight' },
    { id: '5', name: 'Cruce de Poleas', muscleGroup: 'Chest', equipment: 'Cable' },
    { id: '6', name: 'Press Declinado (Barra)', muscleGroup: 'Chest', equipment: 'Barbell' },
    { id: '7', name: 'Aperturas con Mancuernas', muscleGroup: 'Chest', equipment: 'Dumbbell' },
    { id: '8', name: 'Press en Máquina', muscleGroup: 'Chest', equipment: 'Machine' },
    { id: '9', name: 'Pull Over (Mancuerna)', muscleGroup: 'Chest', equipment: 'Dumbbell' },

    // Back
    { id: '10', name: 'Dominadas', muscleGroup: 'Back', equipment: 'Bodyweight' },
    { id: '11', name: 'Remo con Barra', muscleGroup: 'Back', equipment: 'Barbell' },
    { id: '12', name: 'Jalón al Pecho', muscleGroup: 'Back', equipment: 'Cable' },
    { id: '13', name: 'Remo Gironda', muscleGroup: 'Back', equipment: 'Cable' },
    { id: '14', name: 'Peso Muerto', muscleGroup: 'Back', equipment: 'Barbell' },
    { id: '15', name: 'Remo con Mancuerna', muscleGroup: 'Back', equipment: 'Dumbbell' },
    { id: '16', name: 'Jalón Agarre Cerrado', muscleGroup: 'Back', equipment: 'Cable' },
    { id: '17', name: 'Peso Muerto Rumano', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '18', name: 'Pull Over (Polea)', muscleGroup: 'Back', equipment: 'Cable' },
    { id: '19', name: 'Remo en Máquina', muscleGroup: 'Back', equipment: 'Machine' },

    // Legs
    { id: '20', name: 'Sentadilla (Barra)', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '21', name: 'Prensa de Piernas', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '22', name: 'Extensiones de Cuádriceps', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '23', name: 'Curl Femoral Tumbado', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '24', name: 'Zancadas (Mancuernas)', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { id: '25', name: 'Elevación de Gemelos', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '26', name: 'Sentadilla Frontal', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '27', name: 'Peso Muerto Sumo', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '28', name: 'Hack Squat', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '29', name: 'Zancadas Búlgaras', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { id: '30', name: 'Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '31', name: 'Curl Femoral Sentado', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '63', name: 'Aductores', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '64', name: 'Abductores', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '65', name: 'Extensiones de Cuádriceps', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '66', name: 'Curl Femoral Tumbado', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '67', name: 'Peso Muerto Sumo', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: '68', name: 'Sentadilla Búlgara', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { id: '69', name: 'Elevación de Gemelos de Pie', muscleGroup: 'Legs', equipment: 'Machine' },
    { id: '70', name: 'Zancadas Inversas', muscleGroup: 'Legs', equipment: 'Dumbbell' },
    { id: '71', name: 'Curl Nórdico', muscleGroup: 'Legs', equipment: 'Bodyweight' },
    { id: '72', name: 'Patada de Glúteo', muscleGroup: 'Legs', equipment: 'Cable' },

    // Shoulders
    { id: '32', name: 'Press Militar (Barra)', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { id: '33', name: 'Elevaciones Laterales', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: '34', name: 'Pájaros (Posterior)', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: '35', name: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable' },
    { id: '36', name: 'Press Arnold', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: '37', name: 'Elevaciones Frontales', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
    { id: '38', name: 'Press en Máquina', muscleGroup: 'Shoulders', equipment: 'Machine' },
    { id: '39', name: 'Pájaros en Polea', muscleGroup: 'Shoulders', equipment: 'Cable' },
    { id: '40', name: 'Remo al Mentón', muscleGroup: 'Shoulders', equipment: 'Barbell' },

    // Arms
    { id: '41', name: 'Curl de Bíceps (Barra)', muscleGroup: 'Arms', equipment: 'Barbell' },
    { id: '42', name: 'Curl Martillo', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { id: '43', name: 'Extensiones de Tríceps (Polea)', muscleGroup: 'Arms', equipment: 'Cable' },
    { id: '44', name: 'Press Francés', muscleGroup: 'Arms', equipment: 'Barbell' },
    { id: '45', name: 'Curl Concentrado', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { id: '46', name: 'Curl en Polea', muscleGroup: 'Arms', equipment: 'Cable' },
    { id: '47', name: 'Fondos para Tríceps', muscleGroup: 'Arms', equipment: 'Bodyweight' },
    { id: '48', name: 'Curl Predicador', muscleGroup: 'Arms', equipment: 'Machine' },
    { id: '49', name: 'Patada de Tríceps', muscleGroup: 'Arms', equipment: 'Dumbbell' },
    { id: '50', name: 'Curl Alterno', muscleGroup: 'Arms', equipment: 'Dumbbell' },

    // Core
    { id: '51', name: 'Plancha Abdominal', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: '52', name: 'Crunch Abdominal', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: '53', name: 'Elevación de Piernas', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: '54', name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: '55', name: 'Mountain Climbers', muscleGroup: 'Core', equipment: 'Bodyweight' },
    { id: '56', name: 'Abdominales en Polea', muscleGroup: 'Core', equipment: 'Cable' },
    { id: '57', name: 'Plancha Lateral', muscleGroup: 'Core', equipment: 'Bodyweight' },

    // Cardio
    { id: '58', name: 'Carrera (Treadmill)', muscleGroup: 'Cardio', equipment: 'Machine' },
    { id: '59', name: 'Bicicleta Estática', muscleGroup: 'Cardio', equipment: 'Machine' },
    { id: '60', name: 'Remo (Rower)', muscleGroup: 'Cardio', equipment: 'Machine' },
    { id: '61', name: 'Burpees', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
    { id: '62', name: 'Saltos de Cuerda', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
];
