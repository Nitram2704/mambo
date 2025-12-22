import { Gender, ActivityLevel, Objective } from '@/store/userProfileStore';

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calorie adjustments based on objective
 */
const OBJECTIVE_ADJUSTMENTS: Record<Objective, number> = {
    aggressive_cut: -0.25, // 25% deficit
    weight_loss: -0.15, // 15% deficit
    maintenance: 0, // No change
    lean_bulk: 0.10, // 10% surplus
    bulking: 0.20, // 20% surplus
};

/**
 * Calculate daily calorie goal based on TDEE and objective
 */
export function calculateCalorieGoal(tdee: number, objective: Objective): number {
    const adjustment = OBJECTIVE_ADJUSTMENTS[objective];
    return Math.round(tdee * (1 + adjustment));
}

/**
 * Calculate macro distribution (protein, carbs, fats)
 * Returns grams for each macro
 */
export function calculateMacros(
    calorieGoal: number,
    weight: number,
    objective: Objective
): { protein: number; carbs: number; fats: number } {
    let proteinGramsPerKg: number;
    let fatPercentage: number;

    // Adjust protein and fat based on objective
    switch (objective) {
        case 'aggressive_cut':
            proteinGramsPerKg = 2.4; // Higher protein to preserve muscle
            fatPercentage = 0.25;
            break;
        case 'weight_loss':
            proteinGramsPerKg = 2.2;
            fatPercentage = 0.25;
            break;
        case 'maintenance':
            proteinGramsPerKg = 2.0;
            fatPercentage = 0.25;
            break;
        case 'lean_bulk':
            proteinGramsPerKg = 2.0;
            fatPercentage = 0.25;
            break;
        case 'bulking':
            proteinGramsPerKg = 1.8;
            fatPercentage = 0.30;
            break;
    }

    // Calculate protein (grams)
    const protein = Math.round(weight * proteinGramsPerKg);
    const proteinCalories = protein * 4;

    // Calculate fats (grams)
    const fatCalories = calorieGoal * fatPercentage;
    const fats = Math.round(fatCalories / 9);

    // Calculate carbs (remaining calories)
    const remainingCalories = calorieGoal - proteinCalories - fatCalories;
    const carbs = Math.round(remainingCalories / 4);

    return { protein, carbs, fats };
}

/**
 * Get objective display name in Spanish
 */
export function getObjectiveDisplayName(objective: Objective): string {
    const names: Record<Objective, string> = {
        aggressive_cut: 'Corte Agresivo',
        weight_loss: 'Perder Peso',
        maintenance: 'Mantenimiento',
        lean_bulk: 'Volumen Limpio',
        bulking: 'Ganar Músculo',
    };
    return names[objective];
}

/**
 * Get objective description in Spanish
 */
export function getObjectiveDescription(objective: Objective): string {
    const descriptions: Record<Objective, string> = {
        aggressive_cut: 'Déficit del 25%',
        weight_loss: 'Déficit del 15%',
        maintenance: 'Mantener peso actual',
        lean_bulk: 'Superávit del 10%',
        bulking: 'Superávit del 20%',
    };
    return descriptions[objective];
}

/**
 * Get activity level display name in Spanish
 */
export function getActivityLevelDisplayName(level: ActivityLevel): string {
    const names: Record<ActivityLevel, string> = {
        sedentary: 'Sedentario',
        light: 'Ligero',
        moderate: 'Moderado',
        active: 'Activo',
    };
    return names[level];
}

/**
 * Get activity level description in Spanish
 */
export function getActivityLevelDescription(level: ActivityLevel): string {
    const descriptions: Record<ActivityLevel, string> = {
        sedentary: 'Poco o nada de ejercicio',
        light: 'Ejercicio ligero 1-3 días/semana',
        moderate: 'Ejercicio moderado 3-5 días/semana',
        active: 'Ejercicio intenso 6-7 días/semana',
    };
    return descriptions[level];
}
