import { useNutritionStore, DailyNutrition } from './nutritionStore';

export interface WeeklyStats {
    weekStart: Date;
    weekEnd: Date;
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    avgCaloriesPerDay: number;
    avgProteinPerDay: number;
    avgCarbsPerDay: number;
    avgFatsPerDay: number;
    totalWorkouts: number;
    totalWorkoutMinutes: number;
    avgWorkoutMinutesPerDay: number;
    dailyData: DailyNutrition[];
}

export interface MonthlyStats {
    monthStart: Date;
    monthEnd: Date;
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    avgCaloriesPerDay: number;
    avgProteinPerDay: number;
    avgCarbsPerDay: number;
    avgFatsPerDay: number;
    totalWorkouts: number;
    totalWorkoutMinutes: number;
    weeklyBreakdown: WeeklyStats[];
}

export function getWeeklyStats(date: Date = new Date()): WeeklyStats {
    const nutritionStore = useNutritionStore.getState();

    // Get the start of the week (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Get the end of the week (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Collect daily data for the week
    const dailyData: DailyNutrition[] = [];
    let totalCaloriesConsumed = 0;
    let totalCaloriesBurned = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalWorkouts = 0;
    let totalWorkoutMinutes = 0;

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];

        const dayData = nutritionStore.dailyData[dateKey];
        if (dayData) {
            dailyData.push(dayData);
            totalCaloriesConsumed += dayData.caloriesConsumed;
            totalCaloriesBurned += dayData.caloriesBurned;
            totalProtein += dayData.proteinConsumed;
            totalCarbs += dayData.carbsConsumed;
            totalFats += dayData.fatsConsumed;
            totalWorkouts += dayData.workouts.length;
            totalWorkoutMinutes += dayData.workouts.reduce((sum, w) => sum + w.duration, 0);
        }
    }

    const daysWithData = dailyData.length || 1; // Avoid division by zero

    return {
        weekStart,
        weekEnd,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        avgCaloriesPerDay: Math.round(totalCaloriesConsumed / daysWithData),
        avgProteinPerDay: Math.round(totalProtein / daysWithData),
        avgCarbsPerDay: Math.round(totalCarbs / daysWithData),
        avgFatsPerDay: Math.round(totalFats / daysWithData),
        totalWorkouts,
        totalWorkoutMinutes,
        avgWorkoutMinutesPerDay: Math.round(totalWorkoutMinutes / daysWithData),
        dailyData,
    };
}

export function getMonthlyStats(date: Date = new Date()): MonthlyStats {
    const nutritionStore = useNutritionStore.getState();

    // Get the start of the month
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Get the end of the month
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Calculate weekly breakdown
    const weeklyBreakdown: WeeklyStats[] = [];
    let currentWeekStart = new Date(monthStart);

    while (currentWeekStart <= monthEnd) {
        weeklyBreakdown.push(getWeeklyStats(currentWeekStart));
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Aggregate totals
    let totalCaloriesConsumed = 0;
    let totalCaloriesBurned = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalWorkouts = 0;
    let totalWorkoutMinutes = 0;
    let daysWithData = 0;

    for (let day = new Date(monthStart); day <= monthEnd; day.setDate(day.getDate() + 1)) {
        const dateKey = day.toISOString().split('T')[0];
        const dayData = nutritionStore.dailyData[dateKey];

        if (dayData) {
            daysWithData++;
            totalCaloriesConsumed += dayData.caloriesConsumed;
            totalCaloriesBurned += dayData.caloriesBurned;
            totalProtein += dayData.proteinConsumed;
            totalCarbs += dayData.carbsConsumed;
            totalFats += dayData.fatsConsumed;
            totalWorkouts += dayData.workouts.length;
            totalWorkoutMinutes += dayData.workouts.reduce((sum, w) => sum + w.duration, 0);
        }
    }

    const validDays = daysWithData || 1;

    return {
        monthStart,
        monthEnd,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        avgCaloriesPerDay: Math.round(totalCaloriesConsumed / validDays),
        avgProteinPerDay: Math.round(totalProtein / validDays),
        avgCarbsPerDay: Math.round(totalCarbs / validDays),
        avgFatsPerDay: Math.round(totalFats / validDays),
        totalWorkouts,
        totalWorkoutMinutes,
        weeklyBreakdown,
    };
}
