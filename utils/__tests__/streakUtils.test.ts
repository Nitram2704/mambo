import { isNutritionGoalHit, isCleanEatingHit, calculateNewStreak } from '../streakUtils';
import { DailyNutrition } from '@/store/nutritionStore';
import { UserProfile } from '@/types/schema';

describe('streakUtils', () => {
    const mockGoals = {
        calorieGoal: 2000,
        proteinGoal: 150,
        carbsGoal: 200,
        fatsGoal: 60,
    } as UserProfile;

    describe('isNutritionGoalHit', () => {
        it('should return true if goals are hit within tolerance', () => {
            const daily = {
                caloriesConsumed: 2050, // 2000 * 1.05 = 2100
                proteinConsumed: 145,  // 150 * 0.95 = 142.5
                carbsConsumed: 195,    // 200 * 0.95 = 190
                fatsConsumed: 58,      // 60 * 0.95 = 57
            } as DailyNutrition;
            expect(isNutritionGoalHit(daily, mockGoals)).toBe(true);
        });

        it('should return false if calories exceed tolerance', () => {
            const daily = {
                caloriesConsumed: 2200,
                proteinConsumed: 150,
                carbsConsumed: 200,
                fatsConsumed: 60,
            } as DailyNutrition;
            expect(isNutritionGoalHit(daily, mockGoals)).toBe(false);
        });
    });

    describe('calculateNewStreak', () => {
        it('should increment streak if today and yesterday are hit', () => {
            expect(calculateNewStreak(true, true, 5)).toBe(6);
        });

        it('should start streak at 1 if today is hit but yesterday was not', () => {
            expect(calculateNewStreak(true, false, 5)).toBe(1);
        });

        it('should reset streak to 0 if today is not hit', () => {
            expect(calculateNewStreak(false, true, 5)).toBe(0);
        });
    });
});
