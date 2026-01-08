import {
    calculateBMR,
    calculateTDEE,
    calculateCalorieGoal,
    calculateMacros
} from '../nutrition';

describe('nutrition utils', () => {
    describe('calculateBMR', () => {
        it('should calculate BMR for male correctly', () => {
            // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
            expect(calculateBMR(80, 180, 30, 'male')).toBe(1780);
        });

        it('should calculate BMR for female correctly', () => {
            // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345.25 (no rounding in function)
            expect(calculateBMR(60, 165, 25, 'female')).toBe(1345.25);
        });
    });

    describe('calculateTDEE', () => {
        it('should calculate TDEE correctly for sedentary', () => {
            expect(calculateTDEE(2000, 'sedentary')).toBe(2400);
        });

        it('should calculate TDEE correctly for active', () => {
            expect(calculateTDEE(2000, 'active')).toBe(3450);
        });
    });

    describe('calculateCalorieGoal', () => {
        it('should calculate calorie goal for weight loss correctly', () => {
            // 2000 * (1 - 0.15) = 1700
            expect(calculateCalorieGoal(2000, 'weight_loss')).toBe(1700);
        });

        it('should calculate calorie goal for bulking correctly', () => {
            // 2000 * (1 + 0.20) = 2400
            expect(calculateCalorieGoal(2000, 'bulking')).toBe(2400);
        });
    });

    describe('calculateMacros', () => {
        it('should calculate macros for maintenance correctly', () => {
            const calorieGoal = 2000;
            const weight = 80;
            const objective = 'maintenance';

            const macros = calculateMacros(calorieGoal, weight, objective);

            // protein = 80 * 2.0 = 160
            // fat = 2000 * 0.25 / 9 = 55.55 -> 56
            // carbs = (2000 - 160*4 - 500) / 4 = (2000 - 640 - 500) / 4 = 860 / 4 = 215
            expect(macros.protein).toBe(160);
            expect(macros.fats).toBe(56);
            expect(macros.carbs).toBe(215);
        });
    });
});
