export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Ionicons name
    conditionType: 'COUNT_WORKOUTS' | 'TOTAL_VOLUME' | 'STREAK' | 'SPECIFIC_EXERCISE' | 'EARLY_BIRD' | 'NIGHT_OWL' | 'SESSION_VOLUME' | 'PERFECT_WEEK' | 'MACROS_STREAK' | 'NO_EXCESS_STREAK' | 'LESSONS_COMPLETED' | 'TOTAL_SETS' | 'STRENGTH_RELATIVE' | 'AI_FORM_CHECK' | 'AI_PERFECT_SCORE';
    targetValue: number;
    xpReward: number;
    category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIAL' | 'NUTRITION' | 'LEARNING' | 'STRENGTH' | 'AI';
}

export const ACHIEVEMENTS: Achievement[] = [
    // Beginner
    {
        id: 'first_workout',
        title: 'profile.achievementsList.first_workout.title',
        description: 'profile.achievementsList.first_workout.description',
        icon: 'footsteps',
        conditionType: 'COUNT_WORKOUTS',
        targetValue: 1,
        xpReward: 100,
        category: 'BEGINNER'
    },
    {
        id: 'three_workouts',
        title: 'profile.achievementsList.three_workouts.title',
        description: 'profile.achievementsList.three_workouts.description',
        icon: 'flame',
        conditionType: 'COUNT_WORKOUTS',
        targetValue: 3,
        xpReward: 200,
        category: 'BEGINNER'
    },
    {
        id: 'early_bird',
        title: 'profile.achievementsList.early_bird.title',
        description: 'profile.achievementsList.early_bird.description',
        icon: 'sunny',
        conditionType: 'EARLY_BIRD',
        targetValue: 1,
        xpReward: 150,
        category: 'BEGINNER'
    },

    // Intermediate
    {
        id: 'ten_workouts',
        title: 'profile.achievementsList.ten_workouts.title',
        description: 'profile.achievementsList.ten_workouts.description',
        icon: 'trophy',
        conditionType: 'COUNT_WORKOUTS',
        targetValue: 10,
        xpReward: 500,
        category: 'INTERMEDIATE'
    },
    {
        id: 'streak_3',
        title: 'profile.achievementsList.streak_3.title',
        description: 'profile.achievementsList.streak_3.description',
        icon: 'flash',
        conditionType: 'STREAK',
        targetValue: 3,
        xpReward: 300,
        category: 'INTERMEDIATE'
    },
    {
        id: 'volume_10k',
        title: 'profile.achievementsList.volume_10k.title',
        description: 'profile.achievementsList.volume_10k.description',
        icon: 'barbell',
        conditionType: 'TOTAL_VOLUME',
        targetValue: 10000,
        xpReward: 400,
        category: 'INTERMEDIATE'
    },

    // Advanced
    {
        id: 'fifty_workouts',
        title: 'profile.achievementsList.fifty_workouts.title',
        description: 'profile.achievementsList.fifty_workouts.description',
        icon: 'medal',
        conditionType: 'COUNT_WORKOUTS',
        targetValue: 50,
        xpReward: 1000,
        category: 'ADVANCED'
    },
    {
        id: 'volume_100k',
        title: 'profile.achievementsList.volume_100k.title',
        description: 'profile.achievementsList.volume_100k.description',
        icon: 'fitness',
        conditionType: 'TOTAL_VOLUME',
        targetValue: 100000,
        xpReward: 2000,
        category: 'ADVANCED'
    },
    {
        id: 'night_owl',
        title: 'profile.achievementsList.night_owl.title',
        description: 'profile.achievementsList.night_owl.description',
        icon: 'moon',
        conditionType: 'NIGHT_OWL',
        targetValue: 1,
        xpReward: 150,
        category: 'SPECIAL'
    },
    {
        id: 'squat_master',
        title: 'profile.achievementsList.squat_master.title',
        description: 'profile.achievementsList.squat_master.description',
        icon: 'fitness',
        conditionType: 'SPECIFIC_EXERCISE',
        targetValue: 100,
        xpReward: 500,
        category: 'INTERMEDIATE'
    },
    {
        id: 'bench_press_pro',
        title: 'profile.achievementsList.bench_press_pro.title',
        description: 'profile.achievementsList.bench_press_pro.description',
        icon: 'barbell',
        conditionType: 'SPECIFIC_EXERCISE',
        targetValue: 100,
        xpReward: 500,
        category: 'INTERMEDIATE'
    },
    {
        id: 'deadlift_beast',
        title: 'profile.achievementsList.deadlift_beast.title',
        description: 'profile.achievementsList.deadlift_beast.description',
        icon: 'power',
        conditionType: 'SPECIFIC_EXERCISE',
        targetValue: 100,
        xpReward: 500,
        category: 'INTERMEDIATE'
    },
    {
        id: 'volume_beast',
        title: 'profile.achievementsList.volume_beast.title',
        description: 'profile.achievementsList.volume_beast.description',
        icon: 'thunderstorm',
        conditionType: 'SESSION_VOLUME',
        targetValue: 5000,
        xpReward: 600,
        category: 'ADVANCED'
    },
    {
        id: 'perfect_week',
        title: 'profile.achievementsList.perfect_week.title',
        description: 'profile.achievementsList.perfect_week.description',
        icon: 'calendar',
        conditionType: 'PERFECT_WEEK',
        targetValue: 5,
        xpReward: 400,
        category: 'INTERMEDIATE'
    },
    {
        id: 'volume_25k',
        title: 'profile.achievementsList.volume_25k.title',
        description: 'profile.achievementsList.volume_25k.description',
        icon: 'barbell',
        conditionType: 'TOTAL_VOLUME',
        targetValue: 25000,
        xpReward: 600,
        category: 'INTERMEDIATE'
    },
    {
        id: 'volume_50k',
        title: 'profile.achievementsList.volume_50k.title',
        description: 'profile.achievementsList.volume_50k.description',
        icon: 'fitness',
        conditionType: 'TOTAL_VOLUME',
        targetValue: 50000,
        xpReward: 1000,
        category: 'ADVANCED'
    },
    {
        id: 'streak_7',
        title: 'profile.achievementsList.streak_7.title',
        description: 'profile.achievementsList.streak_7.description',
        icon: 'flame',
        conditionType: 'STREAK',
        targetValue: 7,
        xpReward: 800,
        category: 'ADVANCED'
    },
    {
        id: 'streak_30',
        title: 'profile.achievementsList.streak_30.title',
        description: 'profile.achievementsList.streak_30.description',
        icon: 'rocket',
        conditionType: 'STREAK',
        targetValue: 30,
        xpReward: 3000,
        category: 'ADVANCED'
    },
    {
        id: 'hundred_workouts',
        title: 'profile.achievementsList.hundred_workouts.title',
        description: 'profile.achievementsList.hundred_workouts.description',
        icon: 'shield',
        conditionType: 'COUNT_WORKOUTS',
        targetValue: 100,
        xpReward: 2500,
        category: 'ADVANCED'
    },

    // --- NUEVOS LOGROS FASE 5 ---

    // Consistencia (Adicionales)
    {
        id: 'streak_100',
        title: 'profile.achievementsList.streak_100.title',
        description: 'profile.achievementsList.streak_100.description',
        icon: 'infinite',
        conditionType: 'STREAK',
        targetValue: 100,
        xpReward: 5000,
        category: 'ADVANCED'
    },

    // Fuerza
    {
        id: 'first_pullup',
        title: 'profile.achievementsList.first_pullup.title',
        description: 'profile.achievementsList.first_pullup.description',
        icon: 'body',
        conditionType: 'SPECIFIC_EXERCISE', // Se manejará especial
        targetValue: 1,
        xpReward: 500,
        category: 'STRENGTH'
    },
    {
        id: 'squat_1_5_bw',
        title: 'profile.achievementsList.squat_1_5_bw.title',
        description: 'profile.achievementsList.squat_1_5_bw.description',
        icon: 'barbell',
        conditionType: 'STRENGTH_RELATIVE',
        targetValue: 1.5,
        xpReward: 1000,
        category: 'STRENGTH'
    },

    // Volumen (Adicionales)
    {
        id: 'sets_1000',
        title: 'profile.achievementsList.sets_1000.title',
        description: 'profile.achievementsList.sets_1000.description',
        icon: 'layers',
        conditionType: 'TOTAL_SETS',
        targetValue: 1000,
        xpReward: 800,
        category: 'ADVANCED'
    },

    // Nutrición
    {
        id: 'macros_7_days',
        title: 'profile.achievementsList.macros_7_days.title',
        description: 'profile.achievementsList.macros_7_days.description',
        icon: 'nutrition',
        conditionType: 'MACROS_STREAK',
        targetValue: 7,
        xpReward: 350,
        category: 'NUTRITION'
    },
    {
        id: 'clean_30_days',
        title: 'profile.achievementsList.clean_30_days.title',
        description: 'profile.achievementsList.clean_30_days.description',
        icon: 'leaf',
        conditionType: 'NO_EXCESS_STREAK',
        targetValue: 30,
        xpReward: 1500,
        category: 'NUTRITION'
    },

    // Aprendizaje
    {
        id: 'lessons_10',
        title: 'profile.achievementsList.lessons_10.title',
        description: 'profile.achievementsList.lessons_10.description',
        icon: 'school',
        conditionType: 'LESSONS_COMPLETED',
        targetValue: 10,
        xpReward: 500,
        category: 'LEARNING'
    },

    // AI
    {
        id: 'form_check_1',
        title: 'profile.achievementsList.form_check_1.title',
        description: 'profile.achievementsList.form_check_1.description',
        icon: 'scan',
        conditionType: 'AI_FORM_CHECK',
        targetValue: 1,
        xpReward: 150,
        category: 'AI'
    },
    {
        id: 'form_check_perfect',
        title: 'profile.achievementsList.form_check_perfect.title',
        description: 'profile.achievementsList.form_check_perfect.description',
        icon: 'star',
        conditionType: 'AI_PERFECT_SCORE',
        targetValue: 100,
        xpReward: 500,
        category: 'AI'
    }
];
