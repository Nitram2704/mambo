import { SleepLog, SleepGoals } from '@/store/sleepStore';

/**
 * Calculates a sleep score from 0 to 100.
 * Formula: Score = (DurationScore * 0.5) + (RegularityScore * 0.3) + (QualityScore * 0.2)
 */
export function calculateSleepScore(
    log: SleepLog,
    goals: SleepGoals | null,
    noiseEvents: number = 0
): number {
    // 1. Duration Score (50%)
    const targetMinutes = (goals?.targetHours || 8) * 60;
    const durationRatio = Math.min(log.duration / targetMinutes, 1.2); // Cap at 120%
    let durationScore = 0;

    if (durationRatio >= 0.9 && durationRatio <= 1.1) {
        durationScore = 100;
    } else if (durationRatio < 0.9) {
        durationScore = (durationRatio / 0.9) * 100;
    } else {
        // Over-sleeping also reduces score slightly
        durationScore = 100 - (durationRatio - 1.1) * 100;
    }

    // 2. Regularity Score (30%)
    let regularityScore = 100;
    if (goals?.targetBedtime) {
        const [targetH, targetM] = goals.targetBedtime.split(':').map(Number);
        const bedTime = new Date(log.bedTime);
        const actualH = bedTime.getHours();
        const actualM = bedTime.getMinutes();

        // Calculate difference in minutes (handling midnight)
        let diff = Math.abs((actualH * 60 + actualM) - (targetH * 60 + targetM));
        if (diff > 720) diff = 1440 - diff; // Closest direction

        // Lose 1 point per 2 minutes of deviation, up to 100
        regularityScore = Math.max(0, 100 - diff / 2);
    }

    // 3. Quality/Disturbance Score (20%)
    // Base quality from user rating (1-5) + penalty for noise events
    const baseQuality = (log.quality / 5) * 100;
    const noisePenalty = Math.min(noiseEvents * 5, 40); // Max 40 points penalty for noise
    const qualityScore = Math.max(0, baseQuality - noisePenalty);

    const finalScore = (durationScore * 0.5) + (regularityScore * 0.3) + (qualityScore * 0.2);

    return Math.round(Math.max(0, Math.min(100, finalScore)));
}

/**
 * Identifies chronotype based on average bedtime.
 */
export function getChronotype(avgBedtimeMinutes: number): 'Lion' | 'Bear' | 'Wolf' | 'Dolphin' {
    // Bedtime in minutes (0-1440)
    // Lion: Early (before 10 PM)
    if (avgBedtimeMinutes < 22 * 60 && avgBedtimeMinutes > 4 * 60) return 'Lion';
    // Wolf: Late (after 12 AM)
    if (avgBedtimeMinutes >= 0 && avgBedtimeMinutes < 4 * 60) return 'Wolf';
    if (avgBedtimeMinutes > 24 * 60) return 'Wolf';

    // Bear: Normal (10 PM - 12 AM)
    return 'Bear';

    // Dolphin: Usually identified by high noise/movement, but for this simple logic
    // we'll stick to these three or add a condition for high noise if we had it here.
}
