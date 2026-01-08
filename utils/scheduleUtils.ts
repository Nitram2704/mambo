/**
 * Utility functions for workout scheduling
 * 
 * Rules:
 * 1. Workouts only scheduled Monday-Saturday (no Sundays)
 * 2. Current week: only remaining weekdays from today
 * 3. Future weeks: full Monday-Saturday schedule
 */

/**
 * Get the Monday of the current week
 */
export function getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Calculate difference to Monday
    // If it's Sunday (0), we want to go back 6 days
    // If it's Monday (1), we want to go back 0 days
    // If it's Tuesday (2), we want to go back 1 day
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return monday;
}

/**
 * Get day of week (0 = Monday, 1 = Tuesday, ..., 5 = Saturday, 6 = Sunday)
 * Note: This is different from JavaScript's getDay() where 0 = Sunday
 */
export function getDayOfWeekMondayBased(date: Date): number {
    const jsDay = date.getDay(); // 0 = Sunday
    return jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-based
}

/**
 * Check if a date is a Sunday
 */
export function isSunday(date: Date): boolean {
    return date.getDay() === 0;
}

/**
 * Optimal workout day distribution for different frequencies (Monday-Saturday only)
 * Returns array of day offsets from Monday (0=Mon, 1=Tue, ..., 5=Sat)
 */
export function getOptimalWorkoutDays(daysPerWeek: number): number[] {
    const schedules: Record<number, number[]> = {
        1: [0],                     // Monday
        2: [0, 3],                  // Monday, Thursday
        3: [0, 2, 4],               // Monday, Wednesday, Friday
        4: [0, 1, 3, 4],            // Mon, Tue, Thu, Fri
        5: [0, 1, 2, 3, 4],         // Mon-Fri
        6: [0, 1, 2, 3, 4, 5],      // Mon-Sat
    };
    return schedules[Math.min(daysPerWeek, 6)] || schedules[3];
}

interface ScheduleConfig {
    routineIds: string[];
    daysPerWeek: number;
    weeksToSchedule?: number; // default 4
}

interface ScheduledWorkout {
    routineId: string;
    date: Date;
}

/**
 * Generate smart workout schedule
 * - First week: only remaining days from today (Mon-Sat)
 * - Following weeks: full schedule (Mon-Sat)
 */
export function generateSmartSchedule(config: ScheduleConfig): ScheduledWorkout[] {
    const { routineIds, daysPerWeek, weeksToSchedule = 4 } = config;
    const schedule: ScheduledWorkout[] = [];

    if (routineIds.length === 0) return schedule;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayOfWeek = getDayOfWeekMondayBased(today); // 0=Mon, 5=Sat, 6=Sun
    const monday = getMondayOfWeek(today);

    const optimalDays = getOptimalWorkoutDays(daysPerWeek);

    for (let week = 0; week < weeksToSchedule; week++) {
        let routineIndex = 0;

        for (const dayOffset of optimalDays) {
            // Skip Sundays (dayOffset 6) - shouldn't happen with our schedules but just in case
            if (dayOffset > 5) continue;

            const scheduleDate = new Date(monday);
            scheduleDate.setDate(monday.getDate() + (week * 7) + dayOffset);

            // For the first week, skip days that have already passed


            if (week === 0 && dayOffset < todayDayOfWeek) {
                continue;
            }

            // Also skip if it's today and it's Sunday (edge case)
            if (isSunday(scheduleDate)) {
                continue;
            }

            const routineId = routineIds[routineIndex % routineIds.length];
            schedule.push({
                routineId,
                date: scheduleDate,
            });

            routineIndex++;
        }
    }

    return schedule;
}

/**
 * Generate schedule from a workout plan's schedule array
 * Used by GeneratingPlans.tsx
 */
export function generateScheduleFromPlan(
    routineNameToId: Record<string, string>,
    planSchedule: Array<{ dayNumber: number; routineName: string }>,
    weeksToSchedule: number = 4
): ScheduledWorkout[] {
    const schedule: ScheduledWorkout[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayOfWeek = getDayOfWeekMondayBased(today);
    const monday = getMondayOfWeek(today);

    for (let week = 0; week < weeksToSchedule; week++) {
        for (const day of planSchedule) {
            const routineId = routineNameToId[day.routineName];
            if (!routineId) continue;

            // dayNumber is 1-7 (Mon-Sun), convert to 0-6 offset
            const dayOffset = day.dayNumber - 1;

            // Skip Sundays (dayNumber 7 = dayOffset 6)
            if (dayOffset > 5) {
                console.log(`⚠️ Skipping Sunday schedule for ${day.routineName}`);
                continue;
            }

            const scheduleDate = new Date(monday);
            scheduleDate.setDate(monday.getDate() + (week * 7) + dayOffset);

            // For first week, skip days that have passed
            if (week === 0 && dayOffset < todayDayOfWeek) {
                continue;
            }

            schedule.push({
                routineId,
                date: scheduleDate,
            });
        }
    }

    console.log(`📅 Generated ${schedule.length} workouts (Mon-Sat only, skipping past days)`);
    return schedule;
}

/**
 * Generate schedule with user-selected days
 * @param routineIds - Array of routine IDs to schedule
 * @param selectedDays - Array of day indices (0=Mon, 1=Tue, ..., 5=Sat)
 * @param weeksToSchedule - Number of weeks to schedule (default 4)
 */
export function generateScheduleWithSelectedDays(
    routineIds: string[],
    selectedDays: number[],
    weeksToSchedule: number = 4
): ScheduledWorkout[] {
    const schedule: ScheduledWorkout[] = [];

    if (routineIds.length === 0 || selectedDays.length === 0) return schedule;

    // Filter out Sundays (index 6) and sort
    const validDays = selectedDays.filter(d => d >= 0 && d <= 5).sort((a, b) => a - b);
    if (validDays.length === 0) return schedule;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayOfWeek = getDayOfWeekMondayBased(today);
    const monday = getMondayOfWeek(today);

    for (let week = 0; week < weeksToSchedule; week++) {
        let routineIndex = 0;

        for (const dayOffset of validDays) {
            const scheduleDate = new Date(monday);
            scheduleDate.setDate(monday.getDate() + (week * 7) + dayOffset);

            // For the first week, skip days that have already passed
            if (week === 0 && dayOffset < todayDayOfWeek) {
                continue;
            }

            // Double-check it's not Sunday
            if (scheduleDate.getDay() === 0) {
                continue;
            }

            const routineId = routineIds[routineIndex % routineIds.length];
            schedule.push({
                routineId,
                date: scheduleDate,
            });

            routineIndex++;
        }
    }

    console.log(`📅 Generated ${schedule.length} workouts with custom days: [${validDays.join(', ')}]`);
    return schedule;
}

/**
 * Day names in Spanish (Monday-Saturday only)
 */
export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DAY_NAMES_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

