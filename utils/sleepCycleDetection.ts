/**
 * Sleep Cycle Detection Utility
 * 
 * A typical sleep cycle lasts about 90 minutes.
 * Waking up at the end of a cycle (during light sleep) makes you feel more refreshed.
 */

export interface SleepCycle {
    time: Date;
    cycles: number;
    label: string;
}

/**
 * Calculates optimal wake times if you go to bed now.
 * Takes into account the average 14 minutes it takes to fall asleep.
 */
export function getWakeTimesFromBedtime(bedtime: Date = new Date()): SleepCycle[] {
    const fallAsleepTime = 14; // Average minutes to fall asleep
    const startTime = new Date(bedtime.getTime() + fallAsleepTime * 60000);
    const cycles = [4, 5, 6]; // Most people need 4-6 cycles (6-9 hours)

    return cycles.map(c => {
        const wakeTime = new Date(startTime.getTime() + c * 90 * 60000);
        return {
            time: wakeTime,
            cycles: c,
            label: `${c} ciclos (${c * 1.5}h de sueño)`
        };
    });
}

/**
 * Calculates optimal bedtimes if you want to wake up at a specific time.
 */
export function getBedtimesFromWakeTime(wakeTime: Date): SleepCycle[] {
    const fallAsleepTime = 14;
    const cycles = [4, 5, 6];

    return cycles.map(c => {
        const bedtime = new Date(wakeTime.getTime() - (c * 90 * 60000 + fallAsleepTime * 60000));
        return {
            time: bedtime,
            cycles: c,
            label: `${c} ciclos (${c * 1.5}h de sueño)`
        };
    });
}

/**
 * Finds the optimal wake time within a "Smart Window" before the target time.
 * In a real app, this would use accelerometer data. 
 * Here we use the 90-minute cycle estimation as a fallback.
 */
export function findOptimalWakeTime(targetTime: Date, windowMinutes: number = 30): Date {
    // Fallback: Calculate the end of the nearest 90-minute cycle within the window
    // For simplicity, we'll just return the target time if we don't have sensor data,
    // but we could theoretically suggest a time that aligns better with a cycle.

    // Example: If target is 7:00 and window is 30m (6:30-7:00).
    // If a cycle ends at 6:45, that's better than 7:00.

    const now = new Date();
    // This is a placeholder for actual sensor-based logic
    return targetTime;
}
