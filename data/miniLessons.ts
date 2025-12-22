export interface MiniLesson {
    id: string;
    estimatedTime: string; // "3-5 min"
    category: 'BIOMECHANICS' | 'NUTRITION' | 'RECOVERY' | 'FAT_LOSS' | 'SUPPLEMENTS';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    // The following fields are now handled via translation keys:
    // title: learn.miniLessons.lessons.${id}.title
    // description: learn.miniLessons.lessons.${id}.description
    // introduction: learn.miniLessons.lessons.${id}.introduction
    // sections: learn.miniLessons.lessons.${id}.sections (array)
    // keyTakeaways: learn.miniLessons.lessons.${id}.keyTakeaways (array)
    // quiz: learn.miniLessons.lessons.${id}.quiz (array)
}

export const MINI_LESSONS: MiniLesson[] = [
    {
        id: 'biomechanics_basics',
        estimatedTime: '4 min',
        category: 'BIOMECHANICS',
        difficulty: 'Beginner',
    },
    {
        id: 'nutrition_101',
        estimatedTime: '5 min',
        category: 'NUTRITION',
        difficulty: 'Beginner',
    },
    {
        id: 'recovery_importance',
        estimatedTime: '3 min',
        category: 'RECOVERY',
        difficulty: 'Beginner',
    },
    {
        id: 'fat_loss_vs_muscle',
        estimatedTime: '4 min',
        category: 'FAT_LOSS',
        difficulty: 'Intermediate',
    },
    {
        id: 'supplementation_guide',
        estimatedTime: '5 min',
        category: 'SUPPLEMENTS',
        difficulty: 'Intermediate',
    }
];