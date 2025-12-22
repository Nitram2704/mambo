import { SleepLog, SleepGoals, SleepStats } from '@/store/sleepStore';

export function calculateSleepStats(logs: SleepLog[], goals: SleepGoals | null): SleepStats {
    if (logs.length === 0) {
        return {
            avgDuration: 0,
            avgQuality: 0,
            consistency: 0,
            sleepDebt: 0,
            streak: 0,
        };
    }

    // Calculate averages
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const totalQuality = logs.reduce((sum, log) => sum + log.quality, 0);
    const avgDuration = totalDuration / logs.length;
    const avgQuality = totalQuality / logs.length;

    // Calculate sleep debt
    const targetMinutes = goals ? goals.targetHours * 60 : 8 * 60;
    const sleepDebt = logs.reduce((debt, log) => {
        return debt + (targetMinutes - log.duration);
    }, 0);

    // Calculate consistency (how often within 30 min of target times)
    let consistentDays = 0;
    if (goals) {
        logs.forEach((log) => {
            const bedTime = new Date(log.bedTime);
            const wakeTime = new Date(log.wakeTime);
            const targetBed = parseTime(goals.targetBedtime);
            const targetWake = parseTime(goals.targetWakeTime);

            const bedMinsDiff = Math.abs(bedTime.getHours() * 60 + bedTime.getMinutes() - targetBed);
            const wakeMinsDiff = Math.abs(wakeTime.getHours() * 60 + wakeTime.getMinutes() - targetWake);

            if (bedMinsDiff <= 30 && wakeMinsDiff <= 30) {
                consistentDays++;
            }
        });
    }
    const consistency = logs.length > 0 ? (consistentDays / logs.length) * 100 : 0;

    // Calculate streak (consecutive days meeting goal)
    let streak = 0;
    if (goals) {
        const sortedLogs = [...logs].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const log of sortedLogs) {
            if (log.duration >= targetMinutes && log.quality >= 3) {
                streak++;
            } else {
                break;
            }
        }
    }

    return {
        avgDuration: Math.round(avgDuration),
        avgQuality: Math.round(avgQuality * 10) / 10,
        consistency: Math.round(consistency),
        sleepDebt: Math.round(sleepDebt),
        streak,
    };
}

function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export function calculateSleepDebt(logs: SleepLog[], targetHours: number): number {
    const targetMinutes = targetHours * 60;
    return logs.reduce((debt, log) => debt + (targetMinutes - log.duration), 0);
}

export function calculateConsistency(logs: SleepLog[]): number {
    if (logs.length < 2) return 100;

    const bedTimes = logs.map(log => {
        const bed = new Date(log.bedTime);
        return bed.getHours() * 60 + bed.getMinutes();
    });

    const wakeTimes = logs.map(log => {
        const wake = new Date(log.wakeTime);
        return wake.getHours() * 60 + wake.getMinutes();
    });

    const bedVariance = calculateVariance(bedTimes);
    const wakeVariance = calculateVariance(wakeTimes);

    // Lower variance = higher consistency
    // Map variance (0-120 min) to consistency (100-0%)
    const avgVariance = (bedVariance + wakeVariance) / 2;
    const consistency = Math.max(0, 100 - (avgVariance / 120) * 100);

    return Math.round(consistency);
}

function calculateVariance(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
}
