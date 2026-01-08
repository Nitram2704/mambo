import { calculateSleepStats, calculateSleepDebt, calculateConsistency } from '../sleepAnalytics';
import { SleepLog, SleepGoals } from '@/store/sleepStore';

describe('sleepAnalytics', () => {
    const mockGoals: SleepGoals = {
        targetHours: 8,
        targetBedtime: '23:00',
        targetWakeTime: '07:00',
    };

    const createLog = (date: string, duration: number, quality: number, bedTimeStr: string, wakeTimeStr: string): SleepLog => ({
        id: `log-${date}`,
        date,
        duration, // minutes
        quality: quality as any,
        bedTime: new Date(`${date}T${bedTimeStr}:00`),
        wakeTime: new Date(`${date}T${wakeTimeStr}:00`), // Simplified, assumes same day for simplicity unless crossing midnight handled
        notes: '',
        createdAt: new Date(),
    });

    // Helper to handle cross-midnight dates for wake time if needed, 
    // but for simple stats logic, we just need valid Date strings.
    // Let's assume wake time is next day for typical sleep.
    const createRealisticLog = (startDate: string, durationMinutes: number, quality: number, bedTime: string, wakeTime: string): SleepLog => {
        const start = new Date(`${startDate}T${bedTime}:00`);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        return {
            id: `log-${startDate}`,
            date: startDate,
            duration: durationMinutes,
            quality: quality as any,
            bedTime: start,
            wakeTime: end,
            notes: '',
            createdAt: new Date(),
        };
    };

    describe('calculateSleepStats', () => {
        it('should return zero stats for empty logs', () => {
            const stats = calculateSleepStats([], mockGoals);
            expect(stats).toEqual({
                avgDuration: 0,
                avgQuality: 0,
                consistency: 0,
                sleepDebt: 0,
                streak: 0,
            });
        });

        it('should calculate correct averages', () => {
            const logs = [
                createRealisticLog('2024-01-01', 480, 4, '23:00', '07:00'), // 8h
                createRealisticLog('2024-01-02', 420, 3, '23:30', '06:30'), // 7h
            ];
            const stats = calculateSleepStats(logs, mockGoals);

            expect(stats.avgDuration).toBe(450); // (480 + 420) / 2
            expect(stats.avgQuality).toBe(3.5); // (4 + 3) / 2
        });

        it('should calculate sleep debt correctly', () => {
            // Target 8h = 480m
            const logs = [
                createRealisticLog('2024-01-01', 420, 4, '23:00', '06:00'), // 7h (-60m)
                createRealisticLog('2024-01-02', 450, 4, '23:00', '06:30'), // 7.5h (-30m)
            ];
            const stats = calculateSleepStats(logs, mockGoals);
            expect(stats.sleepDebt).toBe(90); // 60 + 30
        });

        it('should calculate streak correctly', () => {
            // Target 8h (480m), Quality >= 3
            const logs = [
                createRealisticLog('2024-01-03', 480, 4, '23:00', '07:00'), // Met (Most recent)
                createRealisticLog('2024-01-02', 490, 5, '22:50', '07:00'), // Met
                createRealisticLog('2024-01-01', 400, 3, '23:00', '05:40'), // Missed duration
            ];

            const stats = calculateSleepStats(logs, mockGoals);
            expect(stats.streak).toBe(2);
        });

        it('should break streak on low quality', () => {
            const logs = [
                createRealisticLog('2024-01-02', 480, 2, '23:00', '07:00'), // Met duration, missed quality
                createRealisticLog('2024-01-01', 480, 4, '23:00', '07:00'), // Met both
            ];
            const stats = calculateSleepStats(logs, mockGoals);
            expect(stats.streak).toBe(0);
        });
    });

    describe('calculateSleepDebt', () => {
        it('should calculate total sleep debt based on target hours', () => {
            const logs = [
                createRealisticLog('2024-01-01', 420, 4, '23:00', '06:00'), // 7h
            ];
            const debt = calculateSleepDebt(logs, 8); // Target 8h = 480m
            expect(debt).toBe(60);
        });

        it('should return negative debt (surplus) if sleeping more than target', () => {
            const logs = [
                createRealisticLog('2024-01-01', 540, 4, '22:00', '07:00'), // 9h
            ];
            const debt = calculateSleepDebt(logs, 8);
            expect(debt).toBe(-60);
        });
    });

    describe('calculateConsistency', () => {
        it('should return 100 for less than 2 logs', () => {
            expect(calculateConsistency([])).toBe(100);
            expect(calculateConsistency([createRealisticLog('2024-01-01', 480, 4, '23:00', '07:00')])).toBe(100);
        });

        it('should return high consistency for identical times', () => {
            const logs = [
                createRealisticLog('2024-01-01', 480, 4, '23:00', '07:00'),
                createRealisticLog('2024-01-02', 480, 4, '23:00', '07:00'),
                createRealisticLog('2024-01-03', 480, 4, '23:00', '07:00'),
            ];
            const consistency = calculateConsistency(logs);
            expect(consistency).toBe(100);
        });

        it('should return lower consistency for varied times', () => {
            const logs = [
                createRealisticLog('2024-01-01', 480, 4, '21:00', '05:00'),
                createRealisticLog('2024-01-02', 480, 4, '01:00', '09:00'),
            ];
            const consistency = calculateConsistency(logs);
            expect(consistency).toBeLessThan(100);
        });
    });
});
