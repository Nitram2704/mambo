/**
 * Workout math utilities
 */

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight * (1 + reps / 30)
 */
export function calculateOneRM(weight: number, reps: number): number {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate volume for a set
 */
export function calculateVolume(weight: number, reps: number): number {
    return weight * reps;
}
