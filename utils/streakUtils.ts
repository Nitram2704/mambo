import { DailyNutrition } from '@/store/nutritionStore';
import { UserProfile } from '@/types/schema';

/**
 * Check if nutrition goals were hit for a given day
 */
export function isNutritionGoalHit(daily: DailyNutrition, goals: UserProfile): boolean {
    return daily.caloriesConsumed <= goals.calorieGoal * 1.05 && // 5% tolerance
        daily.proteinConsumed >= goals.proteinGoal * 0.95 &&
        daily.carbsConsumed >= goals.carbsGoal * 0.95 &&
        daily.fatsConsumed >= goals.fatsGoal * 0.95;
}

/**
 * Check if clean eating goal was hit (no excess calories)
 */
export function isCleanEatingHit(daily: DailyNutrition, goals: UserProfile): boolean {
    return daily.caloriesConsumed <= goals.calorieGoal * 1.1; // 10% tolerance
}

/**
 * Calculate new streak based on today's performance and yesterday's performance
 */
export function calculateNewStreak(
    isTodayHit: boolean,
    isYesterdayHit: boolean,
    currentStreak: number
): number {
    if (isTodayHit) {
        if (isYesterdayHit) {
            return currentStreak + 1;
        } else {
            return 1;
        }
    } else {
        return 0;
    }
}
